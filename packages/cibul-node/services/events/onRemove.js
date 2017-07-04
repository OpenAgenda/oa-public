"use strict";

const agendaEvents = require( 'agenda-events' );

let log = console.log;

module.exports = event => {

  log( 'removed event %s', event.uid );

  agendaEvents.remove( event.uid );

}

module.exports.setLog = l => log = l;