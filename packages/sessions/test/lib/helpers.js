"use strict";

const redis = require( 'redis' );
const async = require( 'async' );
const express = require( 'express' );
const sa = require( 'superagent' );


let config;

module.exports = {
  init: c => config = c,
  clearRedis,
  redisHGet,
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

  cli.hkeys( config.redis.hash, ( err, result ) => {

    async.each( result, cli.hdel.bind( cli, config.redis.hash ), err => {

      cli.quit();

      cb();

    } );

  } );

}

function redisHGet( hash, key, cb ) {

  let cli = _createClient();

  cli.hget( hash, key, ( err, result ) => {

    cli.quit();

    cb( err, result );

  } );

}

function _createClient() {

  return redis.createClient( config.redis.port, config.redis.host );

}