export default function insertMessageId({ conversationId, userUid, knex, tableName }, messageId) {
  return knex(tableName).insert({
    conversation_id: conversationId,
    user_uid: userUid,
    created_at: new Date(),
    message_id: messageId,
  });
}
