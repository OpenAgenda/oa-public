"use strict";

const agendaSvc = require( 'agendas' );
const wn = require( 'when/node' );

module.exports = {
  getAgendaId,
  keepActiveAggregators
}


async function getAgendaId( agendaUid ) {

  const agenda = await wn.call( agendaSvc.get, { uid: agendaUid }, { private: null, internal: true } );

  if ( !agenda ) return null;

  return agenda.id;

}

async function keepActiveAggregators( agendaIds ) {

  const agendas = ( await wn.call( agendaSvc.list, { id: agendaIds }, { private: null, includeFields: [ 'credentials' ] } ) )[ 0 ];

  return agendas.filter( a => a.credentials.aggregator );

}