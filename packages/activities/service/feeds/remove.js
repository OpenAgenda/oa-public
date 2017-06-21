"use strict";

const _ = require( 'lodash' );
const promisePlusCb = require( 'service-utils/promisePlusCb' );
const logger = require( 'basic-logger' );

let config;
let knex;
let service;
let log;

module.exports = Object.assign( remove, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  log = logger( 'activities/feeds/remove' );

}

function remove( identifiers, cb ) {

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( feed => {

      if ( !feed ) {

        return 0;

      }

      return knex( config.schemas.feed ).delete().where( { id: feed.id } )
        .then( result => {

          log( 'info', 'Feed removed (type %s, uid: %s)', feed.entityType, feed.entityUid );

          return result;

        } );

    } );

  return promisePlusCb( promise, cb );

}
