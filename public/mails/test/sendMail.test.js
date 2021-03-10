'use strict';

const path = require('path');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const createMails = require('../index');
const makeLabelGetter = require('../utils/makeLabelGetter');

const templatesDir = path.join(__dirname, '..', 'templates');

let account;
const getEtherealTransport = () => ({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: account.user, // generated ethereal user
    pass: account.pass, // generated ethereal password
  },
});

beforeAll(async () => {
  account = await nodemailer.createTestAccount();
});

describe('sendMail', () => {
  let mails;

  jest.setTimeout(30000);

  describe('JSON transport', () => {
    beforeAll(async () => {
      mails = await createMails({
        templatesDir,
        transport: {
          jsonTransport: true,
        },
        defaults: {
          data: {
            domain: 'https://openagenda.com',
          },
        },
      });
    });

    it('send email - helloWorld template', async () => {
      const { results, errors } = await mails.send({
        template: 'helloWorld',
        data: {
          username: 'bertho',
        },
        to: [
          'kevin.bertho@gmail.com, kevin.berthommier@openagenda.com',
          {
            address: '"Kaoré" <kaore@openagenda.com>',
            data: { username: 'kaore' },
          },
        ],
        queue: false,
      });

      expect(results).toHaveLength(3);
      expect(errors).toHaveLength(0);

      expect(
        results.map(v => _.omit(
          JSON.parse(v.message),
          'envelopeTime',
          'messageId',
          'messageTime',
          'response'
        ))
      ).toMatchSnapshot();
    });

    it('send a mail to an invalid email returns with errors', async () => {
      const { errors } = await mails.send({
        template: 'helloWorld',
        data: {
          username: 'bertho',
        },
        to: 'kevin.bertho@@gmail',
        queue: false,
      });

      expect(errors).toMatchSnapshot();
    });

    it("send a mail with an error don't send anything", async () => {
      const { errors } = await mails.send({
        template: 'helloWorld',
        to: 'kevin.bertho@@gmail',
      });

      expect(errors).toMatchSnapshot();
    });

    it('sendMail can not override the defaults', async () => {
      const { results } = await mails.send({
        template: 'helloWorld',
        data: {
          domain: 'https://google.com',
          username: 'bertho',
        },
        to: {
          address: 'kevin.bertho@gmail.com',
          data: {
            domain: 'https://bertho.io',
          },
        },
        queue: false,
      });

      const message = JSON.parse(results[0].message);

      expect(message.data.domain).toBe('https://openagenda.com');
    });

    it('sendMail with a missing template throw an error', () => expect(
      mails.send({
        template: 'unknow',
        to: 'kevin.bertho@gmail.com',
        queue: false,
      })
    ).rejects.toThrow("Email template 'unknow' does not exist"));

    it('sendMail with a text email', async () => {
      const res = await mails.send({
        to: {
          address: 'admin@openagenda.com',
          name: '',
        },
        subject: 'Nouvel inscrit à la newsletter',
        text:
          '"dominiquemuslewski@chaumesenretz.fr" a été ajouté à la newsletter. <%- root %>',
        data: {
          root: 'https://openagenda.com',
          emailSettingsLink: 'https://openagenda.com/settings/emails',
          isRegisteredUser: false,
        },
        queue: false,
      });

      const message = JSON.parse(res.results[0].message);

      expect(message.subject).toBe('Nouvel inscrit à la newsletter');
      expect(message.text).toBe(
        '"dominiquemuslewski@chaumesenretz.fr" a été ajouté à la newsletter. https://openagenda.com'
      );
    });
  });

  describe('Euthreal transport', () => {
    beforeAll(async () => {
      mails = await createMails({
        templatesDir,
        transport: getEtherealTransport(),
        defaults: {
          from: 'no-reply@openagenda.com',
          data: {
            domain: 'https://openagenda.com',
          },
        },
      });

      await mails.init();
    });

    it('send email directly (without queue) - helloWorld template', async () => {
      const { results, errors } = await mails.send({
        template: 'helloWorld',
        data: {
          username: 'Bertho',
        },
        to: [
          '"Kévin Berthommier" <kevin.bertho@gmail.com>, kevin.berthommier@openagenda.com',
          { address: 'kaore@openagenda.com', data: { username: 'Kaore' } },
        ],
        queue: false,
      });

      expect(errors).toHaveLength(0);

      for (const result of results) {
        // console.log(`Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
        expect(result.response).toContain('250');
      }

      expect(
        results.map(v => _.omit(v, 'envelopeTime', 'messageId', 'messageTime', 'response'))
      ).toMatchSnapshot();
    });

    it('override default "from" value', async () => {
      const from = 'admin@openagenda.com';

      const { results, errors } = await mails.send({
        template: 'helloWorld',
        from,
        to: [
          {
            address: 'kevin.bertho@gmail.com',
            name: 'Kévin Berthommier',
            data: { username: 'Bertho' },
          },
        ],
        queue: false,
      });

      expect(errors).toHaveLength(0);

      for (const result of results) {
        // console.log(`Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
        expect(result.response).toContain('250');
      }

      expect(results[0].envelope.from).toBe(from);

      expect(
        results.map(v => _.omit(v, 'envelopeTime', 'messageId', 'messageTime', 'response'))
      ).toMatchSnapshot();
    });
  });

  describe('translations', () => {
    it('take a default lang', async () => {
      mails = await createMails({
        templatesDir,
        transport: {
          jsonTransport: true,
        },
        defaults: {
          data: {
            domain: 'https://openagenda.com',
          },
          lang: 'en',
        },
        translations: {
          labels: {
            'helloWorld-i18n': {
              hello: {
                fr: 'Salut %username%',
                en: 'Hello %username%',
              },
              goToOA: {
                fr: 'Aller sur OpenAgenda',
                en: 'Go to OpenAgenda',
              },
            },
          },
          makeLabelGetter,
        },
      });

      const { results, errors } = await mails.send({
        template: 'helloWorld-i18n',
        to: {
          address: 'kevin.bertho@gmail.com',
          data: { username: 'bertho' },
        },
        queue: false,
      });

      expect(errors).toHaveLength(0);
      expect(results).toHaveLength(1);

      expect(
        results.map(v => {
          v.message = JSON.parse(v.message);
          return _.omit(v, 'messageId', 'message.messageId');
        })
      ).toMatchSnapshot();
    });

    it('choose a lang per recipient', async () => {
      mails = await createMails({
        templatesDir,
        transport: {
          jsonTransport: true,
        },
        defaults: {
          data: {
            domain: 'https://openagenda.com',
          },
          lang: 'en',
        },
        translations: {
          labels: {
            'helloWorld-i18n': {
              hello: {
                fr: 'Salut %username%',
                en: 'Hello %username%',
              },
              goToOA: {
                fr: 'Aller sur OpenAgenda',
                en: 'Go to OpenAgenda',
              },
            },
          },
          makeLabelGetter,
        },
      });

      const { results, errors } = await mails.send({
        template: 'helloWorld-i18n',
        to: {
          address: 'kevin.bertho@gmail.com',
          data: { username: 'bertho' },
          lang: 'fr',
        },
        queue: false,
      });

      expect(errors).toHaveLength(0);
      expect(results).toHaveLength(1);

      expect(
        results.map(v => {
          v.message = JSON.parse(v.message);
          return _.omit(v, 'messageId', 'message.messageId');
        })
      ).toMatchSnapshot();
    });
  });
});
