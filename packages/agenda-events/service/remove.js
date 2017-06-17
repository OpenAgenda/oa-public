"use strict";

const _ = require( 'lodash' );

const w = require( 'when' );

const get = require( './get' );

let config, knex;

module.exports = _.extend( remove, { 
  init: ( c, k ) => { config = c; knex = k },
  byLegacyId
} );

async function remove( agendaUid, eventUid ) {

  return await _remove( {
    event_uid: eventUid,
    agenda_uid: agendaUid
  }, await get( agendaUid, eventUid ) );

}

async function byLegacyId( agendaId = null, eventId = null ) {

  if ( !agendaId && !eventId ) {

    throw new Error( 'Invalid request' );

  }

  if ( agendaId === null || eventId === null ) {

    let removedRows = await knex( config.schemas.agendaEvent ).del()
      .where( 'legacy_id', 'like', '%' + ( agendaId || '' ) + '.' + ( eventId || '' ) + '%' );

    return {
      success: removedRows >= 1
    }

  }

  return await _remove( {
    legacy_id: [ agendaId, eventId ].join( '.' )
  }, await get.byLegacyId(  agendaId, eventId ) );

}

async function _remove( where, current ) {

  let success = false;

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  if ( current === null ) {

    return {
      success,
      code: 'not_found'
    }

  }

  let removedRows = await knex( config.schemas.agendaEvent )

    .del()

    .where( where );

  success = removedRows === 1;

  if ( success && config.interfaces.onRemove ) {

    config.interfaces.onRemove( current );

  }

  return {
    success
  }

}