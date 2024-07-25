export default function list({ conversationId, userUid, knex, tableName }) {
  return knex(tableName)
    .select(['message_id'])
    .where({
      user_uid: userUid,
      conversation_id: conversationId,
    })
    .then(rows => rows.map(r => r.message_id));
}
