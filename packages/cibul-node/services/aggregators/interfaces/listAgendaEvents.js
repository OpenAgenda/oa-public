"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );

module.exports = ( agenda, lastId ) => {

  return agendaEvents( agenda.uid ).listByLastId( {
    state: 'published'
  }, lastId );

}