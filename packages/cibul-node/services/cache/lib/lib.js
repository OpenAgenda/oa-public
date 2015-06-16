"use strict";

var cli,

redis = require( 'redis' ),

utils = require( '../../../lib/utils' );

module.exports = {
  enabled: enabled,
  get: get,
  load: load,
  getCli: getCli,
  init: init
}

function init( config ) {

  cli = redis.createClient( config.port, config.host );

}

function getCli() {

  return cli;

}

function get( key, subKey, cb ) {

  if ( arguments.length === 3 ) {

    cli.hget( key, subKey, onResponse );

  } else {

    cb = subKey;

    cli.get( key, onResponse );

  }

  function onResponse( err, data ) {

    var cachedData;

    try {

      cachedData = JSON.parse( data );

    } catch( e ) {

      cb( 'Invalid cached data' );

      return;

    }

    cb( null, cachedData );

  }

}


function load( keys, method, expire, args, cb ) {

  var args = Array.prototype.slice.call( arguments ),

  cb = args.pop();

  args.splice( 0, 3 );

  args.push( function( err, data ) {

    if ( err || data === undefined || data === null ) {

      // redis does not take those.
      return cb( err, data );

    }

    if ( utils.isArray( keys ) ) {

      cli.hset( keys[ 0 ], keys[ 1 ], JSON.stringify( data ), onRedisResponse );

    } else {

      cli.set( keys, JSON.stringify( data ), onRedisResponse );

    }

    function onRedisResponse( err, result ) {

      // if expire is set, define it here
      if ( expire ) cli.expire( utils.isArray( keys ) ? keys[ 0 ] : keys, parseInt( Math.ceil( expire / 1000 ), 10 ) );

      if ( err ) return cb( err );

      cb( null, data );

    }

  } );


  method.apply( null, args );

}


function enabled() {

  return !!cli;

}