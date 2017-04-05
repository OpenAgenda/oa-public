"use strict";

const _ = require( 'lodash' );
const promisePlusCb = require( 'service-utils/promisePlusCb' );
const schema = require( 'validators/schema' );
const validators = require( 'validators' );

let config;
let knex;
let service;

module.exports = Object.assign( follow, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

}

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

function follow() {

  const {
    identifiers,
    originFeedId,
    store,
    cb
  } = parseArguments.apply( null, arguments );

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( targetFeed => {

      return service.feed( originFeedId ).get( { internal: true } )
        .then( originFeed => ({ targetFeed, originFeed }) );

    } )
    .then( ( { targetFeed, originFeed } ) => {

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

      return knex( config.schemas.feed_follow )
        .insert( { target_feed: targetFeed.id, origin_feed: originFeed.id, store: JSON.stringify( store || {} ) } )
        .then( ( [ feedFollowId ] ) => feedFollowId );

    } );

  return promisePlusCb( promise, cb );

};
