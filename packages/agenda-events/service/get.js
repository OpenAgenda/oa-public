"use strict";

const _ = require( 'lodash' ),

  validate = require( '../iso/validate' );

let config, knex;

module.exports = _.extend( get, {
  init: ( c, k ) => { config = c; knex = k },
  byLegacyId
} );

async function get( agendaUid, eventUid ) {

  return await _get( {
    'agenda_uid' : agendaUid,
    'event_uid' : eventUid
  } );

}

async function byLegacyId( agendaId, eventId ) {

  return await _get( {
    'legacy_id' : agendaId + '.' + eventId
  } );

}

async function _get( where ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  const ref = await knex( config.schemas.agendaEvent )
    .first( [
      'agenda_uid',
      'event_uid',
      'user_uid',
      'state',
      'can_edit',
      'featured',
      'created_at',
      'updated_at',
      'legacy_id'
    ] )
    .where( where );

  if ( !ref ) return null;

  return validate( _.mapKeys( ref, ( v, k ) => _.camelCase( k ) ) );

}
