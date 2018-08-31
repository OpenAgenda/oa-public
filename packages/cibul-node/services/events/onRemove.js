"use strict";

const log = require( '@openagenda/logs' )( 'events/interfaces/onRemove' );
const eventSearch = require( '../eventSearch' );

module.exports = async ( event, context ) => {

  log( 'info', 'removed event %s', event.uid, { context } );

  eventSearch.events.remove( event.uid, { ...context, deletion: true } );

}
