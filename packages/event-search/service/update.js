"use strict";

const config = require( './config' ),
  
  _ = require( 'lodash' ),
  
  handleError = require( './helpers/handleError' ),
  
  lastTimingEndsIn = require( './helpers/lastTimingEndsIn' ),

  parseQuery = require( './query' ),

  remove = require( './remove' ),
  
  parseDoc = require( './index/preParse' );

module.exports = async function( alias, identifiers, eventPart, options = {} ) {

  const params = _.extend( {
    refresh: false,
    expire: false
  }, options ),

    { client, type } = config;

  let ttl, lastTimingEndsInDays, res;

  if ( params.expire && eventPart.timings ) {

    lastTimingEndsInDays = lastTimingEndsIn( eventPart );

    ttl = lastTimingEndsInDays + 'd';

  }

  if ( lastTimingEndsInDays !== undefined && lastTimingEndsInDays < 0 ) {

    return await remove( alias, identifiers, options );

  }

  try {

    res = await client.update( {
      index: alias,
      type,
      body: {
        doc: parseDoc( eventPart, true )
      },
      id: identifiers.uid,
      refresh: params.refresh,
      ttl
    } );

  } catch ( err ) {

    return handleError( err, 'failed to update event %s in index of alias %s', identifiers.uid, alias );

  }

  return {
    success: res.result === 'updated',
    ttl
  }

}