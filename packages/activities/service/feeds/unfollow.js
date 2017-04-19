"use strict";

const _ = require( 'lodash' );
const promisePlusCb = require( 'service-utils/promisePlusCb' );
const logger = require( 'basic-logger' );

let config;
let knex;
let service;
let log;

module.exports = Object.assign( unfollow, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  log = logger( 'activities - unfollow' );

}

function unfollow( identifiers, followedFeedIdentifiers, cb ) {

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( feed => {

      return service.feed( followedFeedIdentifiers ).get( { internal: true } )
        .then( followedFeed => {

          return knex( config.schemas.feed_follow ).delete().where( {
            origin_feed: followedFeed.id,
            target_feed: feed.id
          } )
            .then( result => {

              log( 'info', {
                originFeed: followedFeed,
                targetFeed: feed,
                message: 'Feed n° %s unfollow feed n° %s'
              }, feed.id, followedFeed.id );

              return result;

            } );

        } );

    } );

  return promisePlusCb( promise, cb );

}
