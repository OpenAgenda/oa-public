import initializeTable from './initializeTable.js';
import insert from './insert.js';
import list from './list.js';

const tableName = 'inboxes_message_ids';

export default async function MessageIds(config, services) {
  const { knex } = services;

  await initializeTable(knex, tableName);

  return (conversationId, userUid) => ({
    insert: insert.bind(null, { conversationId, userUid, knex, tableName }),
    list: list.bind(null, { conversationId, userUid, knex, tableName }),
  });
}
