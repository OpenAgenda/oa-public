export default function insertReplyTo({ conversationId, knex, tableName }, userUid, replyToEmail) {
  return knex(tableName).insert({
    conversation_id: conversationId,
    created_at: new Date(),
    user_uid: userUid,
    reply_to: replyToEmail,
  });
}
