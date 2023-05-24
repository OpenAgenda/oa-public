'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  // Deletes ALL existing entries
  await knex(schemas.feed_follow).del();

  await knex(schemas.feed_follow).insert([
    {
      'id': 2,
      'origin_feed': 6,
      'target_feed': 4,
      'store': '{}',
    },
    {
      'id': 3,
      'origin_feed': 4,
      'target_feed': 7,
      'store': '{}',
    },
    {
      'id': 4,
      'origin_feed': 4,
      'target_feed': 8,
      'store': '{}',
    },
    {
      'id': 5,
      'origin_feed': 8,
      'target_feed': 9,
      'store': '{}',
    },
    {
      'id': 6,
      'origin_feed': 9,
      'target_feed': 8,
      'store': '{}',
    },
    {
      'id': 7,
      'origin_feed': 8,
      'target_feed': 10,
      'store': '{}',
    },
  ]);
};
