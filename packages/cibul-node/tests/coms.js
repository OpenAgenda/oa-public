process.env.NODE_ENV = 'testing';

var config = require('../config'),

debug = require('debug'),

async = require('async'),

coms = require('../coms')( config );

debug.enable('*');

var log = debug('coms-tests');

async.waterfall([

  function( wcb ) {

    log( 'registering consumer' );

    coms.persistentConsume( 'test', function( err, values ) {

      if ( err ) return log( err );

      log( 'consumed values "%s"', JSON.stringify( values ) );

    });

    wcb();

  },

  function( wcb ) {

    log( 'queuing' );

    coms.queue( 'test', { a: '1', b: '2' }, function( err ) {

      log('queued');

      if ( err ) return log( err );

      wcb();

    });

  },

  function( wcb ) {

    log( 'more queueing' );

    coms.queue( 'test', { c: '3', d: '4' }, function( err ) {

      log('queued');

      if ( err ) return log( err );

      wcb();

    });

  }

], function( err, results ) {

  if ( err ) log( err );

  log('done.');

});