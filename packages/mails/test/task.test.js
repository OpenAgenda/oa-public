const _ = require( 'lodash' );
const nodemailer = require( 'nodemailer' );
const mails = require( '../index' );
const config = require( '../config' );

describe( 'task', () => {
  beforeAll( async () => {
    const account = await nodemailer.createTestAccount();

    await config.init( {
      transport: {
        pool: true,
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: account.user, // generated ethereal user
          pass: account.pass // generated ethereal password
        },
        maxConnections: 1,
        maxMessages: Infinity,
        rateLimit: 1,
        rateDelta: 300
      },
      defaults: {
        data: {
          domain: 'https://openagenda.com'
        }
      },
      queueName: 'mailsTest-task'
    } );

    await config.queue.clear();

    await mails( {
      template: 'helloWorld',
      to: 'first@unlock'
    } );
  } );

  beforeEach( () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  } );

  it( 'respect rateLimit with pool transporter', async done => {
    const recipients = [
      'kevin.bertho@gmail.com',
      'kevin.berthommier@openagenda.com',
      'user1@openagenda.com',
      'user2@openagenda.com',
      'user3@openagenda.com',
      'user4@openagenda.com',
      'user5@openagenda.com',
      'user6@openagenda.com',
      'kaore@openagenda.com'
    ];

    const start = Date.now();
    const spy = jest.spyOn( config.transporter, 'sendMail' );

    // launch task after spyOn
    mails.task();

    const { results, errors } = await mails( {
      template: 'helloWorld',
      data: {
        username: 'unknown'
      },
      to: recipients
    } );

    let idleCounter = 0;
    config.transporter.on( 'idle', () => {
      idleCounter += 1;

      if ( spy.mock.calls.length === 9 ) {
        expect( _.map( spy.mock.calls, '[0].to.address' ) ).toEqual( recipients );
        expect( idleCounter ).toBe( 9 );
        expect( Date.now() - start ).toBeGreaterThan( ( recipients.length - 1 ) * 300 );
        done();
      }
    } );

    expect( results ).toHaveLength( 9 );
    expect( errors ).toHaveLength( 0 );
  } );
} );
