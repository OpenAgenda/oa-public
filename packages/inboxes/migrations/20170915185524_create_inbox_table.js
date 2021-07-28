'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  if (await knex.schema.hasTable(schemas.inbox)) {
    return;
  }

  return knex.schema.createTable(schemas.inbox, table => {
    table.charset('utf8');
    table.collate('utf8_general_ci');

    table.bigIncrements('id').unsigned().primary();
    table.string('type').notNullable();
    table.bigInteger('identifier').unsigned().notNullable();
  });
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.inbox);
};
