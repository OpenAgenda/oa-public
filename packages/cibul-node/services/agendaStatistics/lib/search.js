"use strict";

const _ = require( 'lodash' );
const states = require( '@openagenda/agenda-events' ).states;

module.exports = async (eventSearch, agendaUid) => {

  if ( !await eventSearch.agendas( agendaUid ).exists() ) return null;

  const { total } = await eventSearch.agendas( agendaUid ).search( {}, { size: 0 } );

  const { total: published } = await eventSearch.agendas( agendaUid ).search( { 'state.code' : states.PUBLISHED }, { size: 0 } );

  const { total: toBeCompleted } = await eventSearch.agendas( agendaUid ).search( { 'state.code' : states.TOCONTROL }, { size: 0 } );

  const { total: ready } = await eventSearch.agendas( agendaUid ).search( { 'state.code' : states.CONTROLLED }, { size: 0 } );

  return { total, published, ready, toBeCompleted, checksum: total === published + toBeCompleted + ready };

}
