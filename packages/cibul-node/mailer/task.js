/**
 * send all the things by mail using SES
 * 
 * listens to coms mailer queue
 */

var debug = require('debug'),

lib = require('../lib'),

log = debug('mailer');

module.exports = function( config, coms ) {

  log('loading task');

  var running = false,

  _send,           // send function reference

  run = function() {

    if ( running ) {

      log('already running');

      return;

    }

    log('running');

    running = true;

    _sesMailer( config, function( err, sendFunc ) {

      if ( err ) return log('initialisation error: %s', JSON.stringify( err ) );

      _send = sendFunc;

      _listen();

    });

  },

  _listen = function() {

    coms.consume( 'mailer', function( err, values ) {

      if ( err ) return log('consumption error: %s', JSON.stringify( err ) ); // do more robust shit here

      log('consuming');

      var recipients = ( typeof values.recipient == 'string' ) ? [ values.recipient ] : values.recipient,

      recipient = recipients.pop();

      if ( recipients.length ) _queue(lib.extend( values, { recipient : recipients }));

      _send({
        recipient: recipient,
        subject: values.subject ? values.subject : 'Cibul',
        html: values.html,
        text: values.text
      }, function( err, params, data ) { // ready for queue

        if ( err ) return log('send error: %s', JSON.stringify( err )); // do more robust shit here

        _listen();

      }, function( err, params, data ) {

        if ( err ) return log('send error: %s', JSON.stringify( err )); // do more robust shit here

      });

    });

  },

  _queue = function( values ) {

    log( 'requeuing remaining recipients : (%s left)', values.recipient.length );

    coms.queue( 'mailer', values );

  };

  return run;

};

var _sesMailer = function( config, cb ) {

  log('initing Amazon SES interface');

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

    log('initing sesMailer');

    lib.extend( AWS.config, awsConfig );

    ses = new AWS.SES();

    ses.getSendQuota(function(err, data) {

      if ( err ) return cb( err );

      minDelay = ( delayMargin + 1 / data.MaxSendRate ) * 1000;

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

    if ( !params.text && !params.html ) return cb( 'missing text and html. use either or both');

    if ( !mailerConfig.source ) return cb( 'missing source ');


    // prepare SES request

    sesParams = {
      Destination: {
        ToAddresses: params.recipient
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

    log('ses params ready');

    _sleep( function() {

      log('sending mail request');

      (config.bogus ? _bogusSender : ses.sendEmail)( sesParams, function( err, data ) {

        sendResultCb( err, params, data );

      });

      cb();

    });

  },

  _sleep = function( cb ) {

    var diff = Date.now() - latestTick,

    sleepTime = diff > minDelay ? 0 : minDelay - diff;

    log( 'need to sleep %sms before send', sleepTime );

    setTimeout(function() {

      cb();

      latestTick = Date.now();

    }, sleepTime );

  };

  _init();

},

_bogusSender = function( params, cb ) {

  log('bogus sending: %s', JSON.stringify( params ));

  var responseTime = Math.random()*1000;

  setTimeout(function() {

    cb( null, params, { bogus: 'sent'});

  }, responseTime);

};