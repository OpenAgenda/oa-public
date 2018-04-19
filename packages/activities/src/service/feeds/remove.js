"use strict";

const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );
const log = require( '@openagenda/logs' )( 'activities/feeds/remove' );

let config;
let knex;
let service;

module.exports = Object.assign( remove, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

}

function remove( identifiers, cb ) {

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( feed => {

      if ( !feed ) {

        return 0;

      }

      return knex( config.schemas.feed ).delete().where( { id: feed.id } )
        .then( result => {

          log( 'Feed removed (type %s, uid: %s)', feed.entityType, feed.entityUid );

          return result;

        } );

    } );

  return promisePlusCb( promise, cb );

}
