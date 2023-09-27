'use strict';

const _ = require('lodash');
const log = require( '@openagenda/logs' )( 'activities/notifications/prepareSummary' );

module.exports = async function prepareSummary(config, feed) {
  const { knex, interfaces } = config;
  const { getUser, sendSummary } = interfaces;

  try {
    const user = await getUser(feed.entity_uid);

    if (!user) {
      return;
    }

    let notifications = await knex(config.schemas.feed_notification).select()
      .where({ feed_id: feed.id, state: 0, sent: 0 })
      .andWhere('id', '>=', feed.minNotifId)
      .orderBy('updated_at', 'desc');

    notifications = notifications.map(notif => {
      notif = _.mapKeys(notif, (value, key) => _.camelCase(key));
      notif.store = JSON.parse(notif.store || '{}');

      return notif;
    });

    await sendSummary({
      user,
      feedId: feed.id,
      notifications,
    }, config);

    await config.knex(config.schemas.feed_notification)
      .where('feed_id', feed.id)
      .whereIn('id', notifications.map(v => v.id))
      .update({ sent: 1 });
  } catch (e) {
    log('error', `Can't send notifications summary to user ${feed.entity_uid}`, e);
  }
};
