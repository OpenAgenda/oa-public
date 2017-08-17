"use strict";

const eventSearch = require( '../eventSearch' );

let log = console.log;

module.exports = ( before, after, context ) => {

  log( 'updated event %s with context %s', after.uid, JSON.stringify( context ) );

  eventSearch.events.batch.update( after, context ); // context should have agendaUid
  
}

module.exports.setLog = l => log = l;