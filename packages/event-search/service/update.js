"use strict";

const config = require( './config' ),
  
  _ = require( 'lodash' ),
  
  handleError = require( './helpers/handleError' ),
  
  parseQuery = require( './query' ),
  
  parseDoc = require( './index/preParse' );

module.exports = async function( alias, identifiers, eventPart, options = {} ) {

  const params = _.extend( {
    refresh: false
  }, options );

  const { client, type } = config;

  let res;

  try {

    res = await client.update( {
      index: alias,
      type,
      body: {
        doc: parseDoc( eventPart, true )
      },
      id: identifiers.uid,
      refresh: params.refresh
    } );

  } catch ( err ) {

    return handleError( err, 'failed to update event %s in index of alias %s', identifiers.uid, alias );

  }

  return {
    success: res.result === 'updated'
  }

}