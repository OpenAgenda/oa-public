'use strict';

const path = require('path');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const redis = require('redis');
const Queues = require('@openagenda/queues');
const createMails = require('../index');

const templatesDir = path.join(__dirname, '..', 'templates');

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('task', () => {
  let mails;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const account = await nodemailer.createTestAccount();

    mails = await createMails({
      templatesDir,
      transport: {
        pool: true,
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: account.user, // generated ethereal user
          pass: account.pass, // generated ethereal password
        },
        maxConnections: 1,
        maxMessages: Infinity,
        rateLimit: 1,
        rateDelta: 300,
      },
      defaults: {
        queue: true,
        data: {
          domain: 'https://openagenda.com',
        },
      },
      Queues: Queues.v2({
        redis: redis.createClient({
          host: 'localhost',
          port: 6379,
        }),
        prefix: 'mails:',
      }),
      queueName: 'mailsTest-task',
    });

    await mails.config.queues.prepareMails.clear();
    await mails.config.queues.sendMails.clear();

    mails.task();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('respect rateLimit with pool transporter', async () => {
    const recipients = [
      'kevin.bertho@gmail.com',
      'kevin.berthommier@openagenda.com',
      'user1@openagenda.com',
      'user2@openagenda.com',
      'user3@openagenda.com',
      'user4@openagenda.com',
      'user5@openagenda.com',
      'user6@openagenda.com',
      'kaore@openagenda.com',
    ];

    const start = Date.now();
    const spy = jest.spyOn(mails.config.transporter, 'sendMail');

    const { results, errors } = await mails.send({
      template: 'helloWorld',
      data: {
        username: 'unknown',
      },
      to: recipients,
    });

    expect(results).toHaveLength(9);
    expect(errors).toHaveLength(0);

    const wait = async () => {
      if (spy.mock.calls.length === 9) {
        return;
      }

      await _sleep(50);

      return wait();
    };

    await wait();

    expect(_.map(spy.mock.calls, '[0].to.address')).toEqual(recipients);
    expect(Date.now() - start).toBeGreaterThan((recipients.length - 1) * 300);
  });

  it("send a mail with an error don't send anything", async () => {
    const spy = jest.spyOn(mails.config.transporter, 'sendMail');

    const { results, errors } = await mails.send({
      template: 'helloWorld',
      to: 'kevin.bertho@@gmail',
    });

    expect(spy.mock.calls).toHaveLength(0);
    expect(results).toHaveLength(0);
    expect(errors).toHaveLength(1);
  });
});
