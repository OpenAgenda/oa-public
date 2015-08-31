"use strict";

/**
 * here dwells a tiny store lib, to store
 * cached control data
 */

var redis = require( 'redis' ),

async = require( 'async' ),

redisConfig,

log = require( 'logger' )( 'controlData', { lib: 'store' } ),

namespace, bufferNamespace;

module.exports = {
  get: get,
  getTimestamp: getTimestamp,
  set: set,
  buffer: buffer(),
  init: init,
  test: {
    clear: clear
  }
}

function buffer() {

  return {
    add: add,
    flush: flush
  }

  function add( id, cb ) {

    var cli = _createClient( cb );

    if ( !cli ) return;

    cli.hincrby( bufferNamespace, id, 1, function( err, result ) {

      cli.quit();

      cb( err, result );

    } );

  }

  function flush( cb ) {

    var cli = _createClient( cb );

    if ( !cli ) return;

    cli.hkeys( bufferNamespace, function( err, ids ) {

      if ( err ) {

        cli.quit();

        return cb( err );

      }

      cli.del( bufferNamespace, function( err ) {

        cli.quit();

        if ( err ) {

          return cb( err );

        }

        cb( null, ids.map( function( i ) { return parseInt( i, 10 ); } ) );

      } );

    });

  }

}

function clear( cb ) {

  var cli = _createClient( cb );

  if ( !cli ) return;

  cli.keys( namespace + '*', function( err, keys ) {

    if ( err ) {

      cli.quit();

      return cb( err );

    }

    async.eachSeries( keys, function( key, ecb ) {

      cli.del( key, ecb );

    }, function( err ) {

      cli.quit();

      cb( err );

    } );

  });

}

function set( uid, data, cb ) {

  log( 'storing data for agenda of uid %s', uid );

  var cli = _createClient( cb );

  if ( !cli ) return;

  cli.set( namespace + ':' + uid, JSON.stringify( data ), function( err ) {

    if ( err ) {

      cli.quit();

      return cb( err );

    }

    cli.set( namespace + ':' + uid + ':timestamp', JSON.parse( JSON.stringify( new Date ) ), function( err ) {

      cli.quit();

      cb( err );

    } );

  } );

}

function get( uid, cb ) {

  var cli = _createClient( cb );

  if ( !cli ) return;

  cli.get( namespace + ':' + uid, function( err, data ) {

    cli.quit();

    if ( err ) {

      return cb( err );

    }

    cb( null, JSON.parse( data ) );

  });

}

function getTimestamp( uid, cb ) {

  var cli = _createClient( cb );

  if ( !cli ) return;

  cli.get( namespace + ':' + uid + ':timestamp', function( err, timestamp ) {

    cli.quit();

    if ( err ) return cb( err );

    if ( !timestamp ) return cb();

    cb( null, new Date( timestamp ) );

  } );

}

function init( c ) {

  redisConfig = c.redis;

  namespace = c.namespace;

  bufferNamespace = c.namespace + ':buffer';

}


function _createClient( cb ) {

  var cli;

  try {

    if ( !redisConfig ) throw 'controlData store has not been initialized';

    cli = redis.createClient( redisConfig.port, redisConfig.host );

  } catch( e ) {

    log( 'error', e );

    if ( cb ) cb( e );

    return;

  }

  return cli;

}