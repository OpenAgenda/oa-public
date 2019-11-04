"use strict";

const log = require( '@openagenda/logs' )( 'events/interfaces/onRemove' );

module.exports = async (services, event, context) => {

  log( 'info', 'removed event %s', event.uid, { context } );

  services.eventSearch.events.remove(event.uid, { ...context, deletion: true });

}
