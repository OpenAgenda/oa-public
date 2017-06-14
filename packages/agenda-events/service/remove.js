"use strict";

const _ = require( 'lodash' );

const w = require( 'when' );

const get = require( './get' );

let config, knex;

module.exports = _.extend( remove, { 
  init: ( c, k ) => { config = c; knex = k }
} );

async function remove( agendaUid, eventUid ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  let current = await get( agendaUid, eventUid );

  if ( current === null ) {

    return {
      success: false,
      code: 'not_found'
    }

  }

  let removedRows = await knex( config.schemas.agendaEvent )

    .del()

    .where( {
      event_uid: eventUid,
      agenda_uid: agendaUid
    } );

  return {
    success: removedRows === 1
  }

}