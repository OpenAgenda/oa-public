export async function up(knex) {
  const { schemas } = knex.client.config;

  const { emailUtilsMessageIds, emailUtilsReplyTos } = schemas;

  if (!await knex.schema.hasTable(emailUtilsMessageIds)) {
    await knex.schema.createTable(emailUtilsMessageIds, (t) => {
      t.increments('id').primary();
      t.bigint('conversation_id');
      t.string('message_id');
      t.date('created_at');
      t.index('conversation_id');
    });
  }

  if (!await knex.schema.hasTable(emailUtilsReplyTos)) {
    await knex.schema.createTable(emailUtilsReplyTos, (t) => {
      t.increments('id').primary();
      t.bigint('conversation_id');
      t.bigint('user_uid');
      t.string('reply_to');
      t.date('created_at');
      t.index('conversation_id');
    });
  }
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  await knex.schema.dropTableIfExists(schemas.emailUtilsMessageIds);
  await knex.schema.dropTableIfExists(schemas.emailUtilsReplyTos);
}
