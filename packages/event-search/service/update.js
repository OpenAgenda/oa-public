"use strict";

const config = require( './config' ),
  
  _ = require( 'lodash' ),
  
  handleError = require( './helpers/handleError' ),
  
  lastTimingEndsIn = require( './helpers/lastTimingEndsIn' ),

  parseQuery = require( './query' ),
  
  parseDoc = require( './index/preParse' );

module.exports = async function( alias, identifiers, eventPart, options = {} ) {

  const params = _.extend( {
    refresh: false,
    expire: false
  }, options ),

    { client, type } = config,

    ttl = params.expire && eventPart.timings ? lastTimingEndsIn( eventPart ) + 'd' : undefined;
  
  let res;

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