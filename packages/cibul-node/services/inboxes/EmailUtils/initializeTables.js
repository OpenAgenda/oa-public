export default async function initializeTable(knex, tableNames) {
  const { messageIds: messageIdsTableName, replyTos: replyTosTableName } = tableNames;

  if (!await knex.schema.hasTable(messageIdsTableName)) {
    await knex.schema.createTable(messageIdsTableName, t => {
      t.increments('id').primary();
      t.bigint('conversation_id');
      t.string('message_id');
      t.date('created_at');
      t.index('conversation_id');
    });
  }

  if (!await knex.schema.hasTable(replyTosTableName)) {
    await knex.schema.createTable(replyTosTableName, t => {
      t.increments('id').primary();
      t.bigint('conversation_id');
      t.bigint('user_uid');
      t.string('reply_to');
      t.date('created_at');
      t.index('conversation_id');
    });
  }
}
