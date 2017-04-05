"use strict";

const _ = require( 'lodash' );
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

      return service.feed( followedFeedIdentifiers ).get( { internal: true } )
        .then( followedFeed => {

          return knex( config.schemas.feed_follow ).delete().where( {
            origin_feed: followedFeed.id,
            target_feed: feed.id
          } );

        } );

    } );

  return promisePlusCb( promise, cb );

};
