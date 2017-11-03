"use strict";

const eventSearch = require( '../eventSearch' );
const log = require( '@openagenda/logs' )( 'events/interfaces/onRemove' );

module.exports = ( event, context ) => {

  log( 'info', 'removed event %s', event.uid, { context } );

  eventSearch.events.remove( event.uid, context ); // context should have agendaUid

}