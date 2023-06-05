"use strict";

const log = require( '@openagenda/logs' )( 'activities/notifications/tasks/sendSummary' );

require( 'moment/locale/fr' );

module.exports = config => {
  const {
    redis: redisClient
  } = config;

  return Object.assign(function queue(data) {
    return redisClient.rPush(config.queue.names.sendSummary, JSON.stringify(data));
  }, {
    task: task.bind(null, config)
  });
};

async function task(config) {
  let summary;

  const {
    redis: redisClient
  } = config;

  while (summary = JSON.parse(await redisClient.lPop(config.queue.names.sendSummary))) {

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
