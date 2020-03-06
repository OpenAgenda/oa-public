'use strict';

exports.up = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.createTableIfNotExists(schemas.message, table => {
    table.charset('utf8');
    table.collate('utf8_general_ci');

    table
      .bigIncrements('id')
      .unsigned()
      .primary();
    table
      .bigInteger('conversation_id')
      .unsigned()
      .notNullable()
      .index();
    table
      .bigInteger('inbox_user_id')
      .unsigned()
      .notNullable()
      .index();
    table.text('body', 'longtext').collate('utf8mb4_unicode_ci');
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .foreign('conversation_id')
      .references(`${schemas.conversation}.id`)
      .onDelete('CASCADE');
    table.foreign('inbox_user_id').references(`${schemas.inboxUser}.id`);
  });
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.message);
};
