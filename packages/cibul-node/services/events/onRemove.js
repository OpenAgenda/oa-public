"use strict";

const agendaEvents = require( 'agenda-events' );

let log = console.log;

module.exports = ( event, context ) => {

  log( 'removed event %s with context %s', event.uid, JSON.stringify( context ) );

  agendaEvents.remove( event.uid );

}

module.exports.setLog = l => log = l;