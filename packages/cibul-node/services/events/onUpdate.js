"use strict";

const eventSearch = require( '../eventSearch' );
const log = require( '@openagenda/logs' )( 'events/interfaces/onUpdate' );

module.exports = ( before, after, context ) => {

  log( 'info', 'updated event %s', after.uid, { context } );

  eventSearch.events.batch.update( after, context ); // context should have agendaUid && updateSearchIndex options
  
}