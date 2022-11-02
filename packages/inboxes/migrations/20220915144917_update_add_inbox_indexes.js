'use strict';

exports.up = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.inbox, t => {
    t.index(['type', 'identifier']);
  });
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.alterTable(schemas.inbox, t => {
    t.dropIndex(['type', 'identifier']);
  });
};
