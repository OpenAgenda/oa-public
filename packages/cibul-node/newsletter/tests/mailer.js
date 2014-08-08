process.env.NODE_ENV = 'testing';

var config = require('../../config'),

debug = require('debug'),

async = require('async');

debug.enable('*');

var log = debug('mailer-tests');

async.waterfall([

  function( wcb ) {

    require('../mailer')( config, wcb );

  },

  // send a single email

  function( mailer, wcb ) {

    mailer.send({
      to: 'kaore@cibul.net',
      subject: 'Yeepeekayyay',
      html: '<p>Dans les prisons de nanteuh</p>',
      text: 'Dans les prisons de nanteuh'
    }, function( err, success ) {

      if ( err ) return wcb( 'mail did not go through %s', JSON.stringify( err ));

      wcb( null, mailer );

    });

  },

  // queue send

  // send a batch of emails

  function( mailer, wcb ) {

    mailer.sendBatch({
      tos: [ 'kaore@cibul.net', 'admin@cibul.net', 'no-reply@cibul.net' ],
      subject: 'Yeepeekayyay',
      html: '<p>Dans les prisons de nanteuh</p>',
      text: 'Dans les prisons de nanteuh'
    }, function( err, processed, fails ) {

      if ( err ) return wcb( 'batch mailing did not go well %s', JSON.stringify( err ));

      log( 'batch processing complete, with %s processed and %s fails', processed.length, fails.length );

      wcb( null, mailer );

    });

  }

], function( err ) {

  if ( err ) return log( JSON.stringify( err ) );

  log('done.');

});