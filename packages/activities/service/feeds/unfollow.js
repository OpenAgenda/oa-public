"use strict";

const log = require( 'logger' )( 'activities/feeds/unfollow' );
const promisePlusCb = require( 'service-utils/promisePlusCb' );

let config;
let knex;
let service;

module.exports = Object.assign( unfollow, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

}

function unfollow( identifiers, followedFeedIdentifiers, cb ) {

  const promise = service.feed( identifiers ).get( { internal: true } )

    .then( feed => {

      if ( feed === null ) {

        return 0;

      }

      return service.feed( followedFeedIdentifiers ).get( { internal: true } )
        .then( followedFeed => {

          if ( followedFeed === null ) {

            return 0;

          }

          return knex( config.schemas.feed_follow ).delete().where( {
            origin_feed: followedFeed.id,
            target_feed: feed.id
          } )
            .then( result => {

              log( 'Feed n° %s unfollow feed n° %s', feed.id, followedFeed.id );

              return result;

            } );

        } );

    } );

  return promisePlusCb( promise, cb );

}
