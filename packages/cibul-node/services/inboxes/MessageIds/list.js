export default function list({ conversationId, knex, tableName }) {
  return knex(tableName)
    .select(['message_id'])
    .where({
      conversation_id: conversationId,
    })
    .then(rows => rows.map(r => r.message_id));
}
