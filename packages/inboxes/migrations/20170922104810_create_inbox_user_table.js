'use strict';

exports.up = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.createTableIfNotExists(schemas.inboxUser, table => {
    table.charset('utf8');
    table.collate('utf8_general_ci');

    table
      .bigIncrements('id')
      .unsigned()
      .primary();
    table
      .bigInteger('inbox_id')
      .unsigned()
      .notNullable()
      .index();
    table
      .bigInteger('user_uid')
      .unsigned()
      .notNullable()
      .index();
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
