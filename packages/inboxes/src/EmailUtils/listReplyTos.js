export default function listReplyTos({ conversationId, knex, tableName }) {
  return knex(tableName)
    .select(['user_uid', 'reply_to'])
    .where({
      conversation_id: conversationId,
    })
    .then((rows) =>
      rows.map((r) => ({ userUid: r.user_uid, replyTo: r.reply_to })));
}
