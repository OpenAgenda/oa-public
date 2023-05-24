'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  // Deletes ALL existing entries
  await knex(schemas.feed_activity).del();

  await knex(schemas.feed_activity).insert([
    {
      'feed_id': 2,
      'activity_id': 1,
      'mask': null,
    },
    {
      'feed_id': 2,
      'activity_id': 3,
      'mask': '["actor","store.labels.actor"]',
    },
    {
      'feed_id': 2,
      'activity_id': 4,
      'mask': null,
    },
    {
      'feed_id': 2,
      'activity_id': 5,
      'mask': null,
    },
    {
      'feed_id': 2,
      'activity_id': 6,
      'mask': null,
    },
    {
      'feed_id': 2,
      'activity_id': 7,
      'mask': null,
    },
  ]);
};
