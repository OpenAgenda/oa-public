'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  if (await knex.schema.hasTable(schemas.messageAttachment)) {
    return;
  }

  return knex.schema.createTable(schemas.messageAttachment, table => {
    table.charset('utf8');
    table.collate('utf8_general_ci');

    table.bigIncrements('id').unsigned().primary();
    table.bigInteger('message_id').unsigned().notNullable().index();
    table.bigInteger('inbox_user_id').unsigned().notNullable().index();
    table.string('original_name').collate('utf8mb4_unicode_ci');
    table.string('filename').collate('utf8mb4_unicode_ci');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table
      .foreign('message_id')
      .references(`${schemas.message}.id`)
      .onDelete('CASCADE');
    table
      .foreign('inbox_user_id')
      .references(`${schemas.inboxUser}.id`)
      .onDelete('CASCADE');
  });
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.messageAttachment);
};
