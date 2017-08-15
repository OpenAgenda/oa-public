"use strict";

const config = require( './config' ),

  _ = require( 'lodash' ),

  handleError = require( './helpers/handleError' );

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

    return handleError( err, 'failed to remove event from index of alias %s', alias );

  }

  return {
    success: res.result === 'deleted'
  }

}