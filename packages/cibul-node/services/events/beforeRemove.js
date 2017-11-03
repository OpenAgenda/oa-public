"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );
const log = require( 'logs' )( 'events/interfaces/beforeRemove' );

module.exports = async ( event, context, cb ) => {

  log( 'will remove event %s', event.uid, { context } );

  try {

    await agendaEvents.remove( event.uid, { context } );

  } catch( e ) {

    log( 'error', 'failed to remove all agenda event references for event uid %s, error: %s', event.uid, e );

  }

  cb();

}