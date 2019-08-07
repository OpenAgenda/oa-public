"use strict";

const log = require( '@openagenda/logs' )( 'activities/feeds/follow' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );

module.exports = follow;

function parseArguments( identifiers, originFeedId, store, cb ) {

  const result = {
    identifiers,
    originFeedId,
    store,
    cb
  };

  const args = Array.isArray( arguments ) ? arguments : Array.from( arguments );

  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 3 ) {

    Object.assign( result, {
      identifiers: args[ 0 ],
      originFeedId: args[ 1 ],
      store: {},
      cb: args[ 2 ]
    } );

  }

  return result;

}

function follow( config ) {

  const { service, knex } = config;

  const {
    identifiers,
    originFeedId,
    store,
    cb
  } = parseArguments.apply( null, Array.prototype.slice.call(arguments, 1) );

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( targetFeed => {

      return service.feed( originFeedId ).get( { internal: true } )
        .then( originFeed => ({ targetFeed, originFeed }) );

    } )
    .then( ( { targetFeed, originFeed } ) => {

      if ( targetFeed === null || originFeed === null ) return 0;

      return knex( config.schemas.feed_follow )
        .select()
        .where( { target_feed: targetFeed.id, origin_feed: originFeed.id } )
        .limit( 1 )
        .then( ( [ feed_follow ] ) => {

          if ( feed_follow ) throw new Error( 'Feed already followed' );

          return { targetFeed, originFeed };

        } );

    } )
    .then( ( { targetFeed, originFeed } ) => {

      if ( !targetFeed || !originFeed ) return 0;

      return knex( config.schemas.feed_follow )
        .insert( { target_feed: targetFeed.id, origin_feed: originFeed.id, store: JSON.stringify( store || {} ) } )
        .then( ( [ feedFollowId ] ) => feedFollowId )
        .then( result => {

          log( 'Feed n° %d follow feed n° %d', targetFeed.id, originFeed.id );

          return result;

        } );

    } );

  return promisePlusCb( promise, cb );

}
