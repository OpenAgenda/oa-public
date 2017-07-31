"use strict";

const config = require( './config' );
const { cleanSession, redisCommand, callbackify } = require( './helpers' );
const logger = require( 'basic-logger' );
const _ = require( 'lodash' );

let log = console.log;

module.exports = function( cursor, count, options, cb ) {

  if ( arguments.length == 3 ) {

    options = {};
    cb = arguments[ 2 ];

  } else if ( arguments.length == 2 ) {

    count = 10;
    options = {};
    cb = arguments[ 1 ];

  }

  callbackify( scan( cursor, count, options ), ( err, r ) => {

    if ( err ) return cb( err );

    cb( null, r.sessions, r.cursor );

  } );

}

module.exports.init = () => {

  log = logger( 'scan' );

}

async function scan( cursor, count, options = {} ) {

  let result = await redisCommand( 'hscan', [ config.redis.hash, cursor, 'count', count ] );

  return {
    sessions: result[ 1 ]
      .filter( ( r, i ) => i % 2 !== 0 )
      .map( JSON.parse ),
    cursor: parseInt( result[ 0 ] )
  }

}