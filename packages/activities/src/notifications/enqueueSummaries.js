"use strict";

const log = require('@openagenda/logs')('activities/notifications/tasks/enqueueSummaries');

// enqueueSummaries -> prepareSummary -> sendSummary

module.exports = async function enqueueSummaries(config) {
  const { knex } = config;
  const { prepareSummary } = config.interfaces;

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

    for await (const feed of stream) {
      await prepareSummary({ feed });
    }
  } catch (e) {
    log('error', 'Can\'t send notifications summary', e);
  }
}
