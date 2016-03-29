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
  updateAgendaEvent: updateAgendaEvent,

  // format stakeholder data coming from db
  formatStakeholder: formatStakeholder
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

      return trx.select( 'credential', 'organization', 'store', 'review_id', 'store', 'user_id' )

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

        v[ destNamespace ] = formatStakeholder( stakeholders[ 0 ] );

      }

      return v;

    } );

  }

}

function formatStakeholder( dbObj ) {

  let stakeholder = {};

  Object.keys( dbObj ).forEach( k => {

    if ( k == 'store' ) return;

    stakeholder[ utils.toCamelCase( k ) ] = dbObj[ k ];

  } );

  if ( stakeholder.reviewId ) {

    stakeholder.agendaId = stakeholder.reviewId;

    delete stakeholder.reviewId;

  }

  try {

    let store = JSON.parse( dbObj.store ),

    fields = store.custom_fields || {};

    Object.keys( fields ).forEach( f => {

      if ( f == 'organization' ) {

        stakeholder.organization = {
          label: fields[ f ],
          slug: stakeholder.organization
        }

      } else {

        stakeholder[ utils.toCamelCase( f ) ] = fields[ f ];

      }

    } );

  } catch( e ) {}

  return stakeholder;

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