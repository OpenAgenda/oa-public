'use strict';

exports.up = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.createTableIfNotExists(
    schemas.inboxConversation,
    table => {
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
    }
  );
};

exports.down = knex => {
  const { schemas } = knex.client.config;

  return knex.schema.dropTableIfExists(schemas.inboxConversation);
};
