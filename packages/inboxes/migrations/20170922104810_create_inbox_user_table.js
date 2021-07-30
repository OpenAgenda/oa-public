'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  if (await knex.schema.hasTable(schemas.inboxUser)) {
    return;
  }

  return knex.schema.createTable(schemas.inboxUser, table => {
    table.charset('utf8');
    table.collate('utf8_general_ci');

    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('inbox_id').unsigned().notNullable().index();
    table.bigInteger('user_uid').unsigned().notNullable().index();
    table.timestamp('left_at').nullable();

    table
      .foreign('inbox_id')
      .references(`${schemas.inbox}.id`)
      .onDelete('CASCADE');
  });
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.inboxUser);
};
