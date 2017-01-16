"use strict";

const redis = require( 'redis' );
const async = require( 'async' );
const express = require( 'express' );
const sa = require( 'superagent' );


let config;

module.exports = {
  init: c => config = c,
  clearRedis,
  redisGet,
  roundTrip,
  launchTestApp
}

function _readAgentSequencePart( s ) {

  let parsed = s.split( ':' );

  return { method: parsed[ 0 ], route: parsed[ 1 ] };

}


function launchTestApp( routes ) {

  let app = express();

  Object.keys( routes ).forEach( k => {

    if ( k === 'use' ) {

      return app.use( routes[ k ] );

    }

    let [ method, path ] = k.split( ':' );

    [].concat( routes[ k ] ).forEach( r => app[ method ]( path, r ) );

  } );

  return app.listen( 3000 );

}

function roundTrip( req, res ) {

  res.send( 'ok' );

}

function clearRedis( cb ) {

  let cli = _createClient();

  cli.keys( config.redis.prefix + '*', ( err, result ) => {

    async.each( result, cli.del.bind( cli ), err => {

      cli.quit();

      cb();

    } );

  } );

}

function redisGet( key, cb ) {

  let cli = _createClient();

  cli.get( key, ( err, result ) => {

    cli.quit();

    cb( err, result );

  } );

}

function _createClient() {

  return redis.createClient( config.redis.port, config.redis.host );

}