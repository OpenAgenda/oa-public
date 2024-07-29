import generateMailBundle from './generateMailBundle.js';
import initializeTables from './initializeTables.js';
import insertMessageId from './insertMessageId.js';
import listMessageIds from './listMessageIds.js';
import listReplyTos from './listReplyTos.js';
import insertReplyTo from './insertReplyTo.js';

const tableNames = {
  messageIds: 'inboxes_email_message_ids',
  replyTos: 'inboxes_email_reply_tos',
};

export default async function EmailUtils(config, services) {
  const { knex } = services;

  await initializeTables(knex, tableNames);

  return conversationId => ({
    replyTos: {
      list: listReplyTos.bind(null, { conversationId, knex, tableName: tableNames.replyTos }),
      insert: insertReplyTo.bind(null, { conversationId, knex, tableName: tableNames.replyTos }),
    },
    messageIds: {
      generateMailBundle: generateMailBundle.bind(null, {
        conversationId,
        knex,
        tableName: tableNames.messageIds,
        mailsDomain: config.mails.domain,
      }),
      insert: insertMessageId.bind(null, {
        conversationId,
        knex,
        tableName: tableNames.messageIds,
      }),
      list: listMessageIds.bind(null, { conversationId, knex, tableName: tableNames.messageIds }),
    },
  });
}
