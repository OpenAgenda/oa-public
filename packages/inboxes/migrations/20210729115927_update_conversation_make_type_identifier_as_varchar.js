'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.conversation, t => {
    t.string('type_identifier', 100).alter();
  });
};

exports.down = async knex => {
  const { schemas } = knex.client.config;

  await knex.schema.alterTable(schemas.conversation, t => {
    t.bigInteger('type_identifier').alter();
  });
};
