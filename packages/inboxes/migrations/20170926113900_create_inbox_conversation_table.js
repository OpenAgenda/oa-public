'use strict';

exports.up = async knex => {
  const { schemas } = knex.client.config;

  if (await knex.schema.hasTable(schemas.inboxConversation)) {
    return;
  }

  return knex.schema.createTable(schemas.inboxConversation, table => {
    table.charset('utf8');
    table.collate('utf8_general_ci');

    table.bigInteger('inbox_id').unsigned().notNullable().index();
    table.bigInteger('conversation_id').unsigned().notNullable().index();

    table
      .foreign('conversation_id')
      .references(`${schemas.conversation}.id`)
      .onDelete('CASCADE');
    table
      .foreign('inbox_id')
      .references(`${schemas.inbox}.id`)
      .onDelete('CASCADE');
  });
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.inboxConversation);
};
