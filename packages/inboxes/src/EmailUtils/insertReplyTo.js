import validateEmail from './validateEmail.js';

function insertReplyTo(
  { conversationId, knex, tableName },
  userUid,
  replyToEmail,
) {
  validateEmail(replyToEmail);

  return knex(tableName).insert({
    conversation_id: conversationId,
    created_at: new Date(),
    user_uid: userUid,
    reply_to: replyToEmail,
  });
}

function insertReplyToIfDifferent(config, user, replyToString) {
  if (!replyToString) {
    return;
  }
  const replyTo = replyToString.replace(/((.+|)<|>$)/g, '');

  validateEmail(replyTo);

  if (replyTo === user.email) {
    return;
  }

  return insertReplyTo(config, user.uid, replyTo);
}

export default Object.assign(insertReplyTo, {
  ifDifferent: insertReplyToIfDifferent,
});
