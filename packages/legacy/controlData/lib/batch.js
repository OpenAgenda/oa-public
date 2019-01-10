"use strict";

const _ = require( 'lodash' );

const set = require( './set' );

module.exports = async ( { prefix, knex, redis }, data ) => {

  const refs = await knex.select(
    'event_uid as eventUid',
    'agenda_uid as agendaUid',
    'legacy_id as legacyId'
  ).from( 'agenda_event' ).where( {
    state: 2,
    event_uid: data.uid
  } );

  const results = [];

  for ( const ref of refs ) {

    results.push( await set( { prefix, knex, redis }, ref, data ) );

  }

  return results;

}
