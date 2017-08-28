"use strict";

const agendaEvents = require( 'agenda-events' );

let log = console.log;

module.exports = async ( event, context, cb ) => {

  log( 'will remove event %s', event.uid );

  try {

    await agendaEvents.remove( event.uid, { context } );

  } catch( e ) {

    log( 'error', 'failed to remove all agenda event references for event uid %s, error: %s', event.uid, e );

  }

  cb();

}

module.exports.setLog = l => log = l;