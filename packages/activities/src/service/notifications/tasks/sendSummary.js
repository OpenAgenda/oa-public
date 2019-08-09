"use strict";

const log = require( '@openagenda/logs' )( 'activities/notifications/tasks/sendSummary' );
const queue = require( '@openagenda/queue' );

require( 'moment/locale/fr' );

module.exports = config => {
  const q = queue( config.queue.names.sendSummary, { redis: config.queue.redis } );

  return Object.assign( q, { task } );
};

async function task( config, q ) {

  let summary;

  while ( summary = await q.pop() ) {

    try {

      await config.interfaces.sendSummary( summary );

    } catch ( e ) {

      log( 'error', 'Cannot send summary of notifications:', e );

    }

  }

}
