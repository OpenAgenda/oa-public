"use strict";

const eventSearch = require( '../eventSearch' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onRemove' );

module.exports = ( ae, context ) => {

  log( 'removed agenda-event %j', ae, { context } );

  // use context.userUid. will be null if nothing was specified at remove
  
  eventSearch.agendas( ae.agendaUid ).remove( ae );

}