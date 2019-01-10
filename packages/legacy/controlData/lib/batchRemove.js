"use strict";

const _ = require( 'lodash' );

const remove = require( './remove' );

module.exports = async ( { prefix, knex, redis }, { uid } ) => {

  const refs = await knex.select(
    'event_uid as eventUid',
    'agenda_uid as agendaUid',
    'legacy_id as legacyId'
  ).from( 'agenda_event' ).where( {
    state: 2,
    event_uid: uid
  } );

  const results = [];

  for ( const ref of refs ) {

    results.push( await remove( { prefix, knex, redis }, ref ) );

  }

  return results;

}
