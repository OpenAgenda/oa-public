import list from './list.js';
import generateId from './generateId.js';

export default async function generateMailBundle({ conversationId, knex, tableName, mailsDomain }, message) {
  const references = await list({ conversationId, knex, tableName }).then(ids => ids.map(id => `<${id}>`));

  return {
    references,
    inReplyTo: references[references.length - 1],
    messageId: generateId({ conversationId, mailsDomain }, message),
  };
}
