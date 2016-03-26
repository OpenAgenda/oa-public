"use strict";

const utils = require( 'utils' );

/**
 * get promises for db resources
 */

var knex, schemas,

log = require( 'basic-logger' )( 'dbUtils' );

module.exports = {
  init: init,
  // get event data
  getEvent: getEvent,

  // get agenda-event reference
  getAgendaEvent: getAgendaEvent,

  // get stakeholder data
  getStakeholder: getStakeholder,

  // update agenda event reference with new stakeholder
  updateAgendaEvent: updateAgendaEvent
}

function getEvent( idNamespace, eventNamespace ) {

  return v => knex.transaction( trx => {

    return trx.select( 'id', 'owner_id', 'slug' )
    
    .from( schemas.event )

    .where( v[ idNamespace ] )

    .limit( 1 ).offset( 0 );

  } )

  .then( events => {

    v[ eventNamespace ] = events && events.length ? utils.toCamelCase( events[ 0 ] ) : null;

    return v;

  } );

}

function getAgendaEvent( agendaNamespace, eventNamespace, destNamespace ) {

  return v => {

    log( 'getAgendaEvent - agenda %s, event %s', JSON.stringify( v[ agendaNamespace ] ), JSON.stringify( v[ eventNamespace ] ) );

    return knex.transaction( trx => {

      return trx.select( 'id', 'user_id' )

      .from( schemas.agendaEvent )

      .where( {
        event_id: v[ eventNamespace ].id,
        review_id: v[ agendaNamespace ].id
      } )

      .limit( 1 ).offset( 0 );

    } )

    .then( agendaEvents => {

      if ( !agendaEvents || !agendaEvents.length ) {

        return v;

      }

      v[ destNamespace ] = utils.toCamelCase( agendaEvents[ 0 ] );

      return v;

    } );

  }

}

function getStakeholder( agendaNamespace, userNamespace, destNamespace ) {

  return v => {

    log( 'getStakeholder - agenda %s, user %s', JSON.stringify( v.agenda ), JSON.stringify( v.user ) );

    return knex.transaction( trx => {

      return trx.select( 'credential', 'organization', 'store' )

      .from( schemas.stakeholder )

      .where( {
        review_id: v[ agendaNamespace ].id,
        user_id: v[ userNamespace ].id
      } )

      .limit( 1 ).offset( 0 );

    } )

    .then( stakeholders => {

      v[ destNamespace ] = null;

      if ( stakeholders && stakeholders.length ) {

        let stakeholder = {
          userId: v[ userNamespace ].id,
          agendaId: v[ agendaNamespace ].id,
          credential: stakeholders[ 0 ].credential
        };

        // extract store data
        try {

          let store = JSON.parse( stakeholders[ 0 ].store ),

          fields = store.custom_fields || {};

          Object.keys( fields ).forEach( f => {

            stakeholder[ utils.toCamelCase( f ) ] = fields[ f ];

          } );

          if ( stakeholder.organization ) {

            stakeholder.organization = {
              label: stakeholder.organization,
              slug: stakeholders[ 0 ].organization
            }

          }

        } catch( e ) {}

        v[ destNamespace ] = stakeholder;

      }

      return v;

    } );

  }

}

function updateAgendaEvent( agendaNamespace, eventNamespace, contributorNamespace ) {

  return v => knex.transaction( trx => {

    return trx.table( schemas.agendaEvent )

    .where( {
      review_id: v[ agendaNamespace ].id,
      event_id: v[ eventNamespace ].id
    } )

    .update( {
      user_id: v[ contributorNamespace ].userId
    } );

  } )

  .then( result => v );

}



function init( config ) {

  schemas = config.schemas;

  knex = config.knex;

}