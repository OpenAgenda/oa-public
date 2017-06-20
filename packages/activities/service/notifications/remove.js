"use strict";

const _ = require( 'lodash' );
const logger = require( 'basic-logger' );
const VError = require( 'verror' );
const promisePlusCb = require( 'service-utils/promisePlusCb' );
const notificationStates = require( '../notificationStates' );

let config;
let knex;
let service;
let log;

module.exports = Object.assign( remove, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  log = logger( 'activities/notifications/remove' );

}

function remove( identifiers, query, cb ) {

  if ( identifiers.entityType && identifiers.entityType !== 'user' ) {

    return promisePlusCb( Promise.reject( new VError( 'The notifications concern only feeds users' ) ), cb );

  }

  const promise = service.feed( identifiers ).get( { internal: true } )
    .then( feed => {

      if ( feed === null ) {
        return Promise.reject( new VError( 'Feed not found' ) );
      }

      if ( feed.entityType !== 'user' ) {
        return Promise.reject( new VError( 'The notifications concern only user feeds' ) );
      }

      return service.feed( feed ).notifications.list( query )
        .then( notifs => {

          return knex( config.schemas.feed_notification )
            .where( 'feed_id', feed.id )
            .whereIn( 'id', notifs.map( v => v.id ) )
            .delete();

        } );

    } );

  return promisePlusCb( promise, cb );

};
