const _ = require( 'lodash' );
const nodemailer = require( 'nodemailer' );
const mails = require( '../index' );
const config = require( '../config' );
const makeLabelGetter = require( '../utils/makeLabelGetter' );

let account;
const getEtherealTransport = () => ( {
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: account.user, // generated ethereal user
    pass: account.pass // generated ethereal password
  }
} );

beforeAll( async () => {
  account = await nodemailer.createTestAccount();
} );

describe( 'sendMail', () => {
  describe( 'JSON transport', () => {
    beforeAll( async () => {
      await config.init( {
        transport: {
          jsonTransport: true
        },
        defaults: {
          data: {
            domain: 'https://openagenda.com'
          }
        },
        queueName: 'mailsTest-sendMail'
      } );

      await config.queue.clear();
    } );

    it( 'send email - helloWorld template', async () => {
      const { results, errors } = await mails( {
        template: 'helloWorld',
        data: {
          username: 'bertho'
        },
        to: [
          'kevin.bertho@gmail.com, kevin.berthommier@openagenda.com',
          { address: '"Kaoré" <kaore@openagenda.com>', data: { username: 'kaore' } }
        ]
      } );

      expect( results ).toHaveLength( 3 );
      expect( errors ).toHaveLength( 0 );

      expect( await config.queue.waitAndPop() ).toMatchSnapshot( 'kevin.bertho@gmail.com mail' );
      expect( await config.queue.waitAndPop() ).toMatchSnapshot( 'kevin.berthommier@openagenda.com mail' );
      expect( await config.queue.waitAndPop() ).toMatchSnapshot( 'kaore@openagenda.com mail' );
    } );

    it( 'send a mail to an invalid email returns with errors', async () => {
      const { errors } = await mails( {
        template: 'helloWorld',
        data: {
          username: 'bertho'
        },
        to: 'kevin.bertho@@gmail',
        queue: false
      } );

      expect( errors ).toMatchSnapshot();
    } );

    it( 'sendMail can not override the defaults', async () => {
      const { results } = await mails( {
        template: 'helloWorld',
        data: {
          domain: 'https://google.com',
          username: 'bertho'
        },
        to: {
          address: 'kevin.bertho@gmail.com',
          data: {
            domain: 'https://bertho.io'
          }
        },
        queue: false
      } );

      const message = JSON.parse( results[ 0 ].message );

      expect( message.data.domain ).toBe( 'https://openagenda.com' );
    } );
  } );

  describe( 'Euthreal transport', () => {
    beforeAll( async () => {
      await config.init( {
        transport: getEtherealTransport(),
        defaults: {
          from: 'no-reply@openagenda.com',
          data: {
            domain: 'https://openagenda.com'
          }
        },
        queueName: 'mailsTest-sendMail'
      } );

      await config.queue.clear();
    } );

    it( 'send email directly (without queue) - helloWorld template', async () => {
      const { results, errors } = await mails( {
        template: 'helloWorld',
        data: {
          username: 'Bertho'
        },
        to: [
          '"Kévin Berthommier" <kevin.bertho@gmail.com>, kevin.berthommier@openagenda.com',
          { address: 'kaore@openagenda.com', data: { username: 'Kaore' } }
        ],
        queue: false
      } );

      expect( errors ).toHaveLength( 0 );

      for ( const result of results ) {
        console.log( `Preview URL: ${nodemailer.getTestMessageUrl( result )}` );
        expect( result.response ).toContain( '250' );
      }

      expect( results.map( v => _.omit( v, 'envelopeTime', 'messageId', 'messageTime', 'response' ) ) ).toMatchSnapshot();
    } );

    it( 'override default "from" value', async () => {
      const from = 'admin@openagenda.com';

      const { results, errors } = await mails( {
        template: 'helloWorld',
        from,
        to: [
          {
            address: 'kevin.bertho@gmail.com',
            name: 'Kévin Berthommier',
            data: { username: 'Bertho' }
          }
        ],
        queue: false
      } );

      expect( errors ).toHaveLength( 0 );

      for ( const result of results ) {
        console.log( `Preview URL: ${nodemailer.getTestMessageUrl( result )}` );
        expect( result.response ).toContain( '250' );
      }

      expect( results[ 0 ].envelope.from ).toBe( from );

      expect( results.map( v => _.omit( v, 'envelopeTime', 'messageId', 'messageTime', 'response' ) ) ).toMatchSnapshot();
    } );
  } );

  describe( 'translations', () => {
    it( 'take a default lang', async () => {
      await config.init( {
        transport: getEtherealTransport(),
        defaults: {
          data: {
            domain: 'https://openagenda.com'
          },
          lang: 'en'
        },
        translations: {
          labels: {
            'helloWorld-i18n': {
              hello: {
                fr: 'Salut %username%',
                en: 'Hello %username%'
              },
              goToOA: {
                fr: 'Aller sur OpenAgenda',
                en: 'Go to OpenAgenda'
              }
            }
          },
          makeLabelGetter
        },
        queueName: 'mailsTest-sendMail'
      } );

      const { results, errors } = await mails( {
        template: 'helloWorld-i18n',
        to: {
          address: 'kevin.bertho@gmail.com',
          data: { username: 'bertho' }
        },
        queue: false
      } );

      expect( errors ).toHaveLength( 0 );
      expect( results ).toHaveLength( 1 );

      for ( const result of results ) {
        console.log( `Preview URL: ${nodemailer.getTestMessageUrl( result )}` );
        expect( result.response ).toContain( '250' );
      }

      expect( results.map( v => _.omit( v, 'envelopeTime', 'messageId', 'messageTime', 'response' ) ) ).toMatchSnapshot();
    } );

    it( 'choose a lang per recipient', async () => {
      await config.init( {
        transport: getEtherealTransport(),
        defaults: {
          data: {
            domain: 'https://openagenda.com'
          },
          lang: 'en'
        },
        translations: {
          labels: {
            'helloWorld-i18n': {
              hello: {
                fr: 'Salut %username%',
                en: 'Hello %username%'
              },
              goToOA: {
                fr: 'Aller sur OpenAgenda',
                en: 'Go to OpenAgenda'
              }
            }
          },
          makeLabelGetter
        },
        queueName: 'mailsTest-sendMail'
      } );

      const { results, errors } = await mails( {
        template: 'helloWorld-i18n',
        to: {
          address: 'kevin.bertho@gmail.com',
          data: { username: 'bertho' },
          lang: 'fr'
        },
        queue: false
      } );

      expect( errors ).toHaveLength( 0 );
      expect( results ).toHaveLength( 1 );

      for ( const result of results ) {
        console.log( `Preview URL: ${nodemailer.getTestMessageUrl( result )}` );
        expect( result.response ).toContain( '250' );
      }

      expect( results.map( v => _.omit( v, 'envelopeTime', 'messageId', 'messageTime', 'response' ) ) ).toMatchSnapshot();
    } );
  } );
} );
