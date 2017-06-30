"use strict";

const config = require( './config' ),

  _ = require( 'lodash' ),

  VError = require( 'verror' );

module.exports = async function( alias, identifiers, options = {} ) {

  const params = _.extend( {
    refresh: false
  }, options );

  const { client, type } = config;

  let res;

  try {

    res = await client.delete( {
      index: alias,
      type: type,
      id: identifiers.uid,
      refresh: params.refresh
    } );

  } catch ( err ) {

    throw new VError( err, 'failed to remove event from index of alias %s', alias );

  }

  return {
    success: res.result === 'deleted'
  }

}