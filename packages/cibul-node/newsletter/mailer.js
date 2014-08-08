/**
 * this interfaces with Amazon SES for sending emails on behalf of the app
 */

var debug = require('debug'),

log = debug('newsletter-mailer'),

lib = require('../lib'),

async = require('async');

module.exports = function( config, cb ) {

  return methods( config, cb );

};

var methods = function( config, cb ) {

  var mailerConfig = lib.extend({
    source: false,
    replyTo: false
  }, config.mailer),

  awsConfig = lib.extend({
    accessKeyId: false,
    secretAccessKey: false,
    region: false
  }, config.aws),

  AWS = require('aws-sdk'),

  ses,

  rate,

  rateMargin = 0.01,

  latestTick = 0,

  queuedSends = [],

  processing = false,

  exposed = function() {

    return {
      sendBatch: sendBatch,
      send: send,
      sandbox: sandbox
    };

  },

  init = function( cb ) {

    lib.extend( AWS.config, awsConfig );

    ses = new AWS.SES();

    ses.getSendQuota(function(err, data) {

      if (err) return cb( err );

      rate = data.MaxSendRate; // rate per second

      cb();

    });

  },

  sendBatch = function( params, cb ) {

    var fails = [], processed = [];

    params.tos.forEach(function( to ) {

      send( lib.extend( { to: to }, params ), function( err ) {

        processed.push( to );

        if ( err ) fails.push(to);

        if ( processed.length === params.tos.length ) cb( null, processed, fails );

      });

    });

  },

  send = function( options, cb ) {

    var params = lib.extend({
      to: false, // recipient(s)
      subject: false, // the subject
      html: false, // this or text will be required
      text: false, // this or html will be required
    }, options),

    sesParams;

    if ( !params.to ) return cb( 'missing to' );

    if ( typeof params.to == 'string' ) params.to = [params.to];

    if ( !params.subject ) return cb( 'missing subject' );

    if ( !params.text && !params.html ) return cb( 'missing text and html. use either or both');

    if ( !mailerConfig.source ) return cb( 'missing source ');


    sesParams = {
      Destination: {
        ToAddresses: params.to
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

    queueSend( sesParams, cb );

  },

  queueSend = function( sesParams, cb ) {

    queuedSends.push([ sesParams, cb ]);

    processQueue();

  },

  processQueue = function() {

    if ( processing || !rate ) return;

    var diff = Date.now() - latestTick,

    period = (1 / rate) * 1000,

    delay = diff > period ? 0 : latestTick + period - Date.now() + rateMargin;

    log('booting send queue process');

    processing = true;

    setTimeout(function() { // delay reboot

      async.whilst(function() {

        return queuedSends.length;

      }, function( wcb ) {

        var send = queuedSends.splice(0, 1)[0],

        sesParams = send[0],

        cb = send[1];

        log('sending email');

        ses.sendEmail( sesParams, function( err, data ) {

          if ( err ) return cb( err );

          log('send was successful: %s', JSON.stringify( data ));

          cb( null, true);

        });

        setTimeout( wcb, period );

      }, function ( err ) {

        log('mailing queue has been processed');

        latestTick = Date.now();

        processing = false;

      });

    }, delay);

  },


  /**
   * for kids
   */

  sandbox = function() {

    log('nothing here.');

  };


  init(function() {

    cb(null, exposed());

  });

};