"use strict";

const config = require( './config' );
const _ = require( 'lodash' );
const handleError = require( './helpers/handleError' );
const log = require( '@openagenda/logs' )( 'remove' );

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

  if ( res.result === 'deleted' ) {

    log( 'info', 'event %j was removed from alias %s', identifiers, alias, {
      operation: 'remove',
      alias,
      identifiers
    } );

  } else {

    log( 'warn', 'event %j was not removed from alias %s', identifiers, alias, {
      operation: 'remove',
      alias,
      identifiers
    } );

  }

  return {
    success: res.result === 'deleted',
    message: res.result === 'deleted' ? 'event was removed' : 'event was not removed'
  }

}