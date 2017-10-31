"use strict";

const config = require( './config' );
const { cleanSession, callbackify, redisCommand } = require( './helpers' );
const log = require( '@openagenda/logs' )( 'scan' );
const _ = require( 'lodash' );

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

async function scan( cursor, limit, options = {} ) {

  let iterationFetches = [], updatedCursor = -1;

  while ( iterationFetches.length < limit && updatedCursor !== 0 ) {

    if ( updatedCursor === -1 ) {

      updatedCursor = cursor;

    }

    let result = await redisCommand( 'scan', [ updatedCursor, 'match', config.redis.prefix + '*', 'count', limit ] );

    updatedCursor = parseInt( result[ 0 ] );

    iterationFetches = iterationFetches.concat( result[ 1 ] );

  }

  let fetchedSessions = [];

  for ( let key of iterationFetches ) {

    fetchedSessions.push( JSON.parse( await redisCommand( 'get', key ) ) );

  }

  return {
    sessions: fetchedSessions,
    cursor: updatedCursor
  }

}