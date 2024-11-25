import validateMessageId from './validateMessageId.js';

export default function insertMessageId(
  { conversationId, knex, tableName },
  messageIdString,
) {
  const messageId = messageIdString.replace(/((.+|)<|>$)/g, '');
  validateMessageId(messageId);

  return knex(tableName).insert({
    conversation_id: conversationId,
    created_at: new Date(),
    message_id: messageId,
  });
}
