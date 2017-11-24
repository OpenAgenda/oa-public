"use strict";

const _ = require( 'lodash' );
const redis = require( 'redis' );
const log = require( '@openagenda/logs' )( 'redisCommand' );
const config = require( '../config' );

let cli;

module.exports = _.extend( redisCommand, { init, shutdown } );

function init() {

  cli = redis.createClient( {
    host: config.redis.host,
    port: config.redis.port,
    retry_strategy: retry
  } );

}

function shutdown() {

  if ( cli === undefined ) return;

  cli.quit();

}

function redisCommand( command, args ) {

  return new Promise( ( rs, rj ) => {

    if ( cli === undefined ) {

      return rj( new Error( 'Service has not been initialized' ) );

    }

    cli[ command ].apply( cli, ( _.isArray( args ) ? args : [ args ] ).concat( ( err, result ) => {

      if ( err ) return rj( err );

      rs( result );

    } ) );

  } );

}

function retry( options ) {

  if ( options.error && options.error.code === 'ECONNREFUSED' ) {

    log( 'error', 'The server refused the connection' );

    return new Error( 'The server refused the connection' );

  }

  if ( options.total_retry_time > 1000 * 60 * 60 ) {

    log( 'error', 'The retry time has been exhausted' );

    return new Error( 'Retry time exhausted' );

  }

  if ( options.times_connected > 10 ) {

    // End reconnecting with built in error
    return undefined;

  }

  // reconnect after
  return Math.min( options.attempt * 100, 3000 );

}