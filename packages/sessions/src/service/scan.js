"use strict";

const { callbackify } = require( './helpers' );
const log = require( '@openagenda/logs' )( 'scan' );
const _ = require( 'lodash' );

module.exports = function( config, cursor, count, options, cb ) {

  if ( arguments.length === 4 ) {

    options = {};
    cb = arguments[ 3 ];

  } else if ( arguments.length == 3 ) {

    count = 10;
    options = {};
    cb = arguments[ 2 ];

  }

  callbackify( scan( config, cursor, count, options ), ( err, r ) => {

    if ( err ) return cb( err );

    cb( null, r.sessions, r.cursor );

  } );

}

async function scan( config, cursor, limit, options = {} ) {
  let iterationFetches = [], updatedCursor = -1;

  while ( iterationFetches.length < limit && updatedCursor !== 0 ) {

    if ( updatedCursor === -1 ) {

      updatedCursor = cursor;

    }

    const result = await config.redisClient.sendCommand(['SCAN', `${updatedCursor}`, 'match', config.redis.prefix + '*', 'count', `${limit}`]);

    updatedCursor = parseInt(result[0], 10);

    iterationFetches = iterationFetches.concat(result[1]);
  }

  let fetchedSessions = [];

  for ( let key of iterationFetches ) {
    fetchedSessions.push(
      JSON.parse(
        await config.redisClient.get([config.redis.prefix, key].join(':'))
      ),
    );
  }

  return {
    sessions: fetchedSessions,
    cursor: updatedCursor
  }

}