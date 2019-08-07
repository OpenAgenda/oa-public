"use strict";

const VError = require( 'verror' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );

module.exports = function remove( config, identifiers, query, cb ) {

  const { service, knex } = config;

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
