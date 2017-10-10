"use strict";

const _ = require( 'lodash' );
const search = require( '../../eventSearch' );
const states = require( 'agenda-events' ).states;

module.exports = async agendaUid => {

  const { total } = await search.agendas( agendaUid ).search( {}, { size: 0 } );

  const { total: published } = await search.agendas( agendaUid ).search( { 'state.code' : states.PUBLISHED }, { size: 0 } );

  const { total: toBeCompleted } = await search.agendas( agendaUid ).search( { 'state.code' : states.TOCONTROL }, { size: 0 } );

  const { total: ready } = await search.agendas( agendaUid ).search( { 'state.code' : states.CONTROLLED }, { size: 0 } );

  return { total, published, toBeCompleted, ready, checksum: total === published + toBeCompleted + ready };

}