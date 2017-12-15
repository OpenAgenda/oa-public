"use strict";

const eventSearch = require( '../eventSearch' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onUpdate' );

module.exports = ( before, after, context ) => {

  log( 'updated agenda-event from %j to %j', before, after, { context } );

  // use context.userUid. Will be null when nothing was specified at update
  
  eventSearch.agendas( after.agendaUid ).update( after );

}