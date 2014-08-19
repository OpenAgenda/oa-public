process.env.NODE_ENV = 'testing';

var config = require('../config'),

debug = require('debug'),

async = require('async'),

coms = require('../coms')( config );

debug.enable('*');

var log = debug('coms-tests');

async.series([

  function( cb ) {

    log( 'testing persistent consumer' );

    log( 'registering consumer' );

    var consumeCount = 0;

    coms.persistentConsume( 'test', function( err, values ) {

      if ( err ) return log( err );

      log( 'consumed values "%s"', JSON.stringify( values ) );

      consumeCount++;

      if ( consumeCount == 2 ) cb();

    });


    log( 'queuing' );

    coms.queue( 'test', { a: '1', b: '2' }, function( err ) {

      log('queued');

      if ( err ) return log( err );

    });


    log( 'more queueing' );

    coms.queue( 'test', { c: '3', d: '4' }, function( err ) {

      log('queued');

      if ( err ) return log( err );

    });

  },

  function( cb ) {

    log( 'ready to do more shit');

    var receivedPublishes = 0;

    coms.subscribe( 'testchannel', function( err, values ) {

      log('got data from channel on first subscriber: %s', JSON.stringify( values ));

      receivedPublishes++;

      if ( receivedPublishes == 4 ) cb();

    });

    coms.subscribe( 'testchannel', function( err, values ) {

      log('got data from channel on second subscriber: %s', JSON.stringify( values ));

      receivedPublishes++;

      if ( receivedPublishes == 4 ) cb();

    });

    log( 'publishing on test channel');

    coms.publish( 'testchannel', { scarTissue: 'that I wish you saw' } );

    coms.publish( 'testchannel', { tibidibidip: 'damn it\'s early' } );

  }

], function( err, results ) {

  if ( err ) log( err );

  log('done.');

});