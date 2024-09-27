'use strict';

exports.up = (knex) => {
  const { schemas } = knex.client.config;

  return knex(schemas.feed_notification).del();
};

exports.down = (_knex) => {
  //
};
