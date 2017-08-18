"use strict";

const eventSearch = require( '../eventSearch' );

let log = console.log;

module.exports = ( ae, context ) => {

  log( 'removed agenda-event %s with context %s', JSON.stringify( ae ), JSON.stringify( context ) );

  // use context.userUid. will be null if nothing was specified at remove
  
  eventSearch.agendas( ae.agendaUid ).remove( ae.eventUid );

}

module.exports.setLog = l => log = l;