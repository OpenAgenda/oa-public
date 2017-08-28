"use strict";

const eventSearch = require( '../eventSearch' );

let log = console.log;

module.exports = ( event, context ) => {

  log( 'removed event %s with context %s', event.uid, JSON.stringify( context ) );

  eventSearch.events.batch.remove( event, context ); // context should have agendaUid

}

module.exports.setLog = l => log = l;