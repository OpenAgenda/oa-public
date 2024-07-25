import generateMailBundle from './generateMailBundle.js';
import initializeTable from './initializeTable.js';
import insert from './insert.js';
import list from './list.js';

const tableName = 'inboxes_message_ids';

export default async function MessageIds(config, services) {
  const { knex } = services;

  await initializeTable(knex, tableName);

  return conversationId => ({
    generateMailBundle: generateMailBundle.bind(null, {
      conversationId,
      knex,
      tableName,
      mailsDomain: config.mails.domain,
    }),
    insert: insert.bind(null, { conversationId, knex, tableName }),
    list: list.bind(null, { conversationId, knex, tableName }),
  });
}
