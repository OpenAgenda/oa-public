"use strict";

const config = require( './config' );
const preParse = require( './index/preParse' );
const clean = require( './helpers/clean' );
const handleError = require( './helpers/handleError' );
const _ = require( 'lodash' );

module.exports = add;


async function add( alias, event, options = {} ) {

  const params = _.extend( {
    refresh: false
  }, options );

  const { client, type } = config;

  const cleanEvent = clean( event );

  let result;

  try {

    result = await client.index( {
      index: alias,
      refresh: params.refresh,
      type,
      id: cleanEvent.uid,
      body: preParse( cleanEvent )
    } );

  } catch ( err ) {

    return handleError( err, 'failed to add event to index' );

  }

  return {
    success: !!result.created
  }

}