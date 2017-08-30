"use strict";

const eventSearch = require( '../eventSearch' );

let log = console.log;

module.exports = ( before, after, context ) => {

  log( 'updated agenda-event from %s to %s with context %s', JSON.stringify( before ), JSON.stringify( after ), JSON.stringify( context ) );

  // use context.userUid. Will be null when nothing was specified at update
  
  eventSearch.agendas( after.agendaUid ).update( after.eventUid );

}

module.exports.setLog = l => log = l;