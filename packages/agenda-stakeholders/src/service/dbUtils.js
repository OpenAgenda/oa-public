"use strict";

const utils = require( '@openagenda/utils' ),

format = require( './format' );

/**
 * get promises for db resources
 */

var knex, schemas,

logger = require( '@openagenda/logs' ), log;

module.exports = {
  
  init,

  // get event data
  getEvent,

  // get agenda-event reference
  getAgendaEvent,

  // get stakeholder data
  getStakeholder,

  // update agenda event reference with new stakeholder
  updateAgendaEvent
}

function getEvent( idNamespace, eventNamespace ) {

  return v => knex.transaction( trx => {

    return trx.select( 'id', 'uid', 'owner_id', 'slug' )
    
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

      let qObj = trx.select( 'credential', 'organization', 'store', 'review_id', 'store', 'user_id', 'id', 'created_at', 'updated_at', 'deleted_user' )

      .from( schemas.stakeholder )

      .where( 'review_id', v[ agendaNamespace ].id );

      if ( v[ userNamespace ].stakeholderId ) {

        qObj.where( 'id', v[ userNamespace ].stakeholderId );

      } else {

        qObj.where( 'user_id', v[ userNamespace ].id );

      }

      qObj.limit( 1 ).offset( 0 );

      return qObj;

    } )

    .then( stakeholders => {

      v[ destNamespace ] = null;

      if ( stakeholders && stakeholders.length ) {

        v[ destNamespace ] = format.dbToObj( stakeholders[ 0 ] );

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

  log = logger( 'dbUtils' );

  schemas = config.schemas;

  knex = config.knex;

}