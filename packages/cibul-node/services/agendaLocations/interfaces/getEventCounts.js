"use strict";

const agendas = require( '@openagenda/agendas' );

module.exports = async ( knex, agendaIdentifiers, locationUids ) => {

  const agenda = await agendas.get( agendaIdentifiers, { private: null } );

  if ( !agenda ) return [];

  const records = await knex( 'event_2 as e' )
    .select( [ 'e.location_uid as locationUid', knex.raw( 'count( e.id ) as eventCount' ) ] )
    .leftJoin( 'agenda_event as ae', 'e.uid', 'ae.event_uid' )
    .whereIn( 'e.location_uid', locationUids )
    .andWhere( 'ae.agenda_uid', agenda.uid )
    .groupBy( 'e.location_uid' );

  return records.map( r => ( {
    uid: r.locationUid,
    count: r.eventCount
  } ) );

}
