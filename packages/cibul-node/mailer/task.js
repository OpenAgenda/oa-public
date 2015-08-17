/**
 * send all the things by mail using SES
 * 
 * listens to coms mailer queue
 */


var log = require( 'logger' )( 'mailer' ),

lib = require( '../lib/lib' ),

config = require( '../config' ),

/**
 * listen to mailer queue and send any incoming mails through Amazon SES service
 */

coms = require( '../lib/coms' ),

cmn = require( '../lib/commons-task' ),

running = false,

cli, // queue client

_send,

_onReady,

_onProcessed;


/**
 * exported function list
 */

exports.load = cmn.makeLoad( run );        // load task using offset and period
exports.run = run;                         // run task
exports.shutdown = shutdown;               // shut everything down
exports.setOnReady = setOnReady;           // optional callback to signal that task is up an running
exports.setOnProcessed = setOnProcessed;   // optional callback called when a mail send has been processed

/**
 * execute the task
 */

function run() {

  if ( running ) {

    log( 'debug', 'already running');

    return;

  }

  log( 'debug', 'running' );

  running = true;

  _sesMailer( config, function( err, sendFunc ) {

    if ( err ) return log( 'error', 'initialisation error: %s', JSON.stringify( err ) );

    _send = sendFunc;

    if ( running ) _listen();

    if ( _onReady ) _onReady();

  });

}


/**
 * stop listening to queue.
 */

function shutdown( ) {

  log( 'debug', 'shutting down' );

  if ( cli ) coms.end( cli );

  running = false;

}


function setOnReady( cb ) {

  _onReady = cb;

}

function setOnProcessed( cb ) {

  _onProcessed = cb;

}


/**
 * stare at queue and call mail function when item shows up
 */

function _listen() {

  log( 'debug', 'listening...' );

  cli = coms.consume( 'mailer', function( err, values ) {

    if ( err ) return log( 'error', 'consumption error: %s', JSON.stringify( err ) ); // do more robust shit here

    log( 'debug', 'consuming' );

    var recipients = ( typeof values.recipient == 'string' ) ? [ values.recipient ] : values.recipient,

    recipient = recipients.pop();

    if ( recipients.length ) _queue(lib.extend( values, { recipient : recipients }));

    _send({
      recipient: recipient,
      subject: values.subject ? values.subject : 'OpenAgenda',
      html: values.html,
      text: values.text
    }, function( err, params, data ) { // called when send is made

      if ( err ) {

        log( 'error', 'send error: %s', JSON.stringify( err )); // do more robust shit here

      } else {

        log( 'debug', 'send triggered' );

      }

      if ( running ) _listen( );

    }, function( err, params, data ) { // called when send service reply is made

      if ( err ) return log( 'error', 'send error: %s', JSON.stringify( err )); // do more robust shit here

      log( 'debug', 'send result received' );

      if ( _onProcessed ) _onProcessed( err, params, data );

    } );

  });

}


/**
 * requeue mailing
 */

function _queue( values ) {

  log( 'debug', 'requeuing remaining recipients : (%s left)', values.recipient.length );

  coms.queue( 'mailer', values );

};


/**
 * initialize mailing function
 */

function _sesMailer( config, cb ) {

  log( 'debug', 'initing Amazon SES interface' );

  var minDelay,          // minimum delay between sends

  latestTick = 0,     // last time a mail was sent

  mailerConfig = lib.extend({
    source: false,
    replyTo: false
  }, config.mailer),

  awsConfig = lib.extend({
    accessKeyId: false,
    secretAccessKey: false,
    region: false
  }, config.aws),

  AWS = require('aws-sdk'),

  delayMargin = 0.01,

  ses, // ses instance

  _init = function() {

    log( 'debug', 'initing sesMailer' );

    lib.extend( AWS.config, awsConfig );

    ses = new AWS.SES();

    ses.getSendQuota(function(err, data) {

      if ( err ) return cb( err );

      minDelay = ( delayMargin + 1 / data.MaxSendRate ) * 1000;

      log( 'debug', 'min delay established at %s', minDelay );

      cb( null, _mail );

    });

  },

  _mail = function( options, cb, sendResultCb ) {

    var params = lib.extend({
      recipient: false, // recipient(s)
      subject: false, // the subject
      html: false, // this or text will be required
      text: false, // this or html will be required
    }, options),

    sesParams;


    // check for missing info

    if ( !params.recipient ) return cb( 'missing recipient' );

    if ( typeof params.to == 'string' ) params.to = [ params.to ];

    if ( !params.subject ) return cb( 'missing subject' );

    if ( !params.text && !params.html ) return cb( 'missing text and html. use either or both' );

    if ( !mailerConfig.source ) return cb( 'missing source' );


    // prepare SES request

    sesParams = {
      Destination: {
        ToAddresses: typeof params.recipient == 'string' ? [ params.recipient ] : params.recipient
      },
      Message: {
        Body: {},
        Subject: {
          Data: params.subject,
          Charset: 'utf-8'
        }
      },
      Source: mailerConfig.source, // required
      ReplyToAddresses: [ mailerConfig.replyTo ],
      ReturnPath: mailerConfig.replyTo
    };

    if ( params.text ) {

      sesParams.Message.Body.Text = { Data: params.text, Charset: 'utf-8' };

    }

    if ( params.html ) {

      sesParams.Message.Body.Html = { Data: params.html, Charset: 'utf-8' };

    }

    log( 'debug', 'ses params ready');

    _sleep( function() {

      log( 'debug', 'sending mail request with params %s', JSON.stringify( sesParams ) );

      if ( config.mailer.simulated ) {
        
        _bogusSender( sesParams, function( err, data ) {

          sendResultCb( err, params, data );

        });

      } else {

        // in prod or in test

        ses.sendEmail( sesParams, function( err, data ) {

          sendResultCb( err, params, data );

        });

      }


      cb();

    });

  },

  _sleep = function( cb ) {

    var diff = Date.now() - latestTick,

    sleepTime = diff > minDelay ? 0 : minDelay - diff;

    log( 'debug', 'need to sleep %sms before send', sleepTime );

    setTimeout(function() {

      cb();

      latestTick = Date.now();

    }, sleepTime );

  };

  _init();

}

function _bogusSender( params, cb ) {

  log( 'debug', 'bogus sending: %s', JSON.stringify( params ));

  var responseTime = Math.random()*1000;

  setTimeout(function() {

    cb( null, params, { bogus: 'sent'});

  }, responseTime);

};