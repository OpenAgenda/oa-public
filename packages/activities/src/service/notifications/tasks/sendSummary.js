"use strict";

const log = require( '@openagenda/logs' )( 'activities/notifications/tasks/sendSummary' );
const queue = require( '@openagenda/queue' );

require( 'moment/locale/fr' );

module.exports = config => {
  const q = queue( config.queue.names.sendSummary, { redis: config.queue.redis } );

  return Object.assign( q, { task: task.bind(null, config, q) } );
};

async function task( config, q ) {

  let summary;

  while ( summary = await q.pop() ) {

    try {

      await config.interfaces.sendSummary( summary, config );

      await config.knex(config.schemas.feed_notification)
        .where('feed_id', summary.feedId)
        .whereIn('id', summary.notifications.map(v => v.id))
        .update({ sent: 1 });

    } catch ( e ) {

      log( 'error', 'Cannot send summary of notifications:', e );

    }

  }

}
