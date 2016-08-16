"use strict";

var q,

utils = require( 'utils' ),

build = require( './build' ),

logger = require( 'logger' ), log,

queue = require( 'queue' ),

store = require( './store' ),

async = require( 'async' ),

lock = require( './lock' ),

flushInterval = 1000 * 10,

q, filteredQueue;

module.exports = launch;

utils.extend( module.exports, {
  init,
  test: {
    setBuild: setBuild,
    setInterval: setInterval
  }
});

function launch() {

  log = logger( 'controlData', { lib: 'task' } );

  q.setConsumer( buffer );

  q.launch();

  filteredQueue.setConsumer( build );

  filteredQueue.launch();

  log( 'info', 'setting flush interval at %s', flushInterval );

  _flushLoop();

}


/**
 * filter requests coming in series before processing
 */

function buffer( data, cb ) {

  log( 'buffering %s', data.id );

  store.buffer.add( data.id, cb );

}

function process( data, cb ) {

  log( 'processing for %s', data.id );

  build( data, cb );

}

function init( cfg ) {

  q = queue( cfg.queuesNamespace + ':queue', { redis: cfg.redis } );

  filteredQueue = queue( cfg.queuesNamespace + ':filtered', { redis: cfg.redis } );

}


function setBuild( b ) {

  build = b; // to test task

}

function setInterval( t ) {

  flushInterval = t;

}


/**
 * flush buffer and stack agenda ids in filter queue
 */

function _flushLoop() {

  log( 'running flush buffer' );

  function _next() {

    setTimeout( _flushLoop, flushInterval );

  }

  // lock or forget about it till next time
  lock( function( err, unlock ) {

    if ( err ) {

      log( 'error', err );

      _next();

      return;

    }

    log( 'lock aquired' );

    store.buffer.flush( function( err, ids ) {

      if ( err ) {

        log( 'error', 'flush error received: %s', err );

        unlock();

        _next();

        return;

      }

      async.eachSeries( ids, function( id, ecb ) {

        log( 'info', 'queuing %s in filtered queue', id );

        filteredQueue( { id: id }, ecb );

      }, function( err ) {

        if ( err ) {

          log( 'error', 'filter queueing error: %s', err );

        } else {

          if ( ids.length ) log( 'info', 'flushed %s', JSON.stringify( ids ) );

        }

        unlock();

        _next();

      });

    });

  });

}