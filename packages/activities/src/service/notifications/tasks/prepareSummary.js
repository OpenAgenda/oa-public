"use strict";

const _ = require('lodash');
const log = require('@openagenda/logs')('activities/notifications/tasks/prepareSummary');

module.exports = async function prepareSummary(config) {
  const { service, knex, interfaces } = config;
  const { getUser, isUnsubscribed } = interfaces;

  try {
    const stream = knex(config.schemas.feed)
      .select(
        config.schemas.feed + '.id',
        config.schemas.feed + '.entity_type',
        config.schemas.feed + '.entity_uid',
        knex.raw(`Min(${config.schemas.feed_notification + '.id'}) AS minNotifId`),
      )
      .join(
        config.schemas.feed_notification,
        config.schemas.feed + '.id',
        config.schemas.feed_notification + '.feed_id',
      )
      .where({ state: 0, sent: 0 })
      // .andWhere(knex.raw(`${config.schemas.feed_notification + '.updated_at'} > CURRENT_TIMESTAMP - INTERVAL 2 DAY`))
      .groupBy(config.schemas.feed_notification + '.feed_id')
      .orderBy(config.schemas.feed_notification + '.feed_id')
      .stream();

    for await (const item of stream) {
      try {
        const user = await getUser(item.entity_uid);

        if (!user) {
          continue;
        }

        let notifications = await knex(config.schemas.feed_notification).select()
          .where({ feed_id: item.id, state: 0, sent: 0 })
          .andWhere('id', '>=', item.minNotifId)
          .orderBy('updated_at', 'desc');

        notifications = notifications.map(notif => {
          notif = _.mapKeys(notif, (value, key) => _.camelCase(key));
          notif.store = JSON.parse(notif.store || '{}');

          return notif;
        });

        if (!await isUnsubscribed(user.uid)) {
          service.tasks.notifications.sendSummary({ user, feedId: item.id, notifications });
        }
      } catch (e) {
        log('error', `Can't send notifications summary to user ${item.entity_uid}`, e);
      }
    }
  } catch (e2) {
    log('error', 'Can\'t send notifications summary', e2);
  }
}
