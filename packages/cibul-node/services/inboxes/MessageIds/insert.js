export default function insertMessageId({ conversationId, knex, tableName }, messageId) {
  return knex(tableName).insert({
    conversation_id: conversationId,
    created_at: new Date(),
    message_id: messageId,
  });
}
