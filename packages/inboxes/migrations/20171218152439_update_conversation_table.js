'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.conversation, t => {
    t.timestamp('closed_at').nullable().defaultTo(null);
  });
};

exports.down = async knex => {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.conversation, t => {
    t.dropColumn('closed_at');
  });
};
