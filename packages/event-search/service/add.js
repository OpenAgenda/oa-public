"use strict";

const config = require( './config' );
const preParse = require( './index/preParse' );
const clean = require( './helpers/clean' );
const lastTimingEndsIn = require( './helpers/lastTimingEndsIn' );
const handleError = require( './helpers/handleError' );
const _ = require( 'lodash' );

module.exports = add;


async function add( alias, event, options = {} ) {

  const params = _.extend( {
    refresh: false,
    expire: false
  }, options );

  const { client, type } = config,

    cleanEvent = clean( event );

  let ttl, lastTimingEndsInDays;

  if ( params.expire ) {

    lastTimingEndsInDays = lastTimingEndsIn( cleanEvent );

    if ( lastTimingEndsInDays < 0 ) {

      return {
        success: false,
        message: 'negative ttl set',
        lastTimingEndsInDays
      }

    }

    ttl = lastTimingEndsInDays + 'd';

  }

  let result;

  try {

    result = await client.index( {
      index: alias,
      refresh: params.refresh,
      type,
      id: cleanEvent.uid,
      body: preParse( cleanEvent ),
      ttl
    } );

  } catch ( err ) {

    return handleError( err, 'failed to add event to index' );

  }

  return {
    success: !!result.created,
    ttl
  }

}