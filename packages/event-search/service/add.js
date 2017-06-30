"use strict";

const config = require( './config' );
const VError = require( 'verror' );
const preParse = require( './index/preParse' );
const clean = require( './helpers/clean' );
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

    throw new VError( err, 'failed to add event to index' );

  }

  return {
    success: !!result.created
  }

}