'use strict';

exports.up = (knex) => {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.feed_activity, (t) => {
    t.text('mask', 'longtext').nullable();
  });
};

exports.down = (_knex) => {
  //
};
