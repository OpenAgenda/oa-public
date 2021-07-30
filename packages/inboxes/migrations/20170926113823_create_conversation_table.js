'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  if (await knex.schema.hasTable(schemas.conversation)) {
    return;
  }

  return knex.schema.createTable(schemas.conversation, table => {
    table.charset('utf8');
    table.collate('utf8_general_ci');

    table.bigIncrements('id').unsigned().primary();
    table.string('type').notNullable();
    table.bigInteger('type_identifier').unsigned().nullable().index();
    table.text('store', 'longtext');
    table.bigInteger('creator_inbox_user_id').unsigned().notNullable().index();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').nullable();
    table.timestamp('resolved_at').nullable();

    table
      .foreign('creator_inbox_user_id')
      .references(`${schemas.inboxUser}.id`);
  });
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.conversation);
};
