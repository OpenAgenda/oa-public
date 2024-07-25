export default async function initializeTable(knex, tableName) {
  const exists = await knex.schema.hasTable(tableName);

  if (exists) {
    return;
  }

  return knex.schema.createTable(tableName, t => {
    t.increments('id').primary();
    t.bigint('conversation_id');
    t.string('message_id');
    t.date('created_at');
    t.index('conversation_id');
  });
}
