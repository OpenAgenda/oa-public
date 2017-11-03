"use strict";

const _ = require( 'lodash' );
const search = require( '../../eventSearch' );
const states = require( '@openagenda/agenda-events' ).states;

module.exports = async agendaUid => {

  if ( !await search.agendas( agendaUid ).exists() ) return null;

  const { total } = await search.agendas( agendaUid ).search( {}, { size: 0 } );

  const { total: published } = await search.agendas( agendaUid ).search( { 'state.code' : states.PUBLISHED }, { size: 0 } );

  const { total: toBeCompleted } = await search.agendas( agendaUid ).search( { 'state.code' : states.TOCONTROL }, { size: 0 } );

  const { total: ready } = await search.agendas( agendaUid ).search( { 'state.code' : states.CONTROLLED }, { size: 0 } );

  return { total, published, ready, toBeCompleted, checksum: total === published + toBeCompleted + ready };

}