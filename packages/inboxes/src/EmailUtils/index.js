import generateMailBundle from './generateMailBundle.js';
import insertMessageId from './insertMessageId.js';
import listMessageIds from './listMessageIds.js';
import listReplyTos from './listReplyTos.js';
import insertReplyTo from './insertReplyTo.js';

export default function EmailUtils({ knex, schemas, mailsDomain }) {
  return (conversationId) => ({
    replyTos: {
      list: listReplyTos.bind(null, {
        conversationId,
        knex,
        tableName: schemas.emailUtilsReplyTos,
      }),
      insert: insertReplyTo.bind(null, {
        conversationId,
        knex,
        tableName: schemas.emailUtilsReplyTos,
      }),
      insertIfDifferent: insertReplyTo.ifDifferent.bind(null, {
        conversationId,
        knex,
        tableName: schemas.emailUtilsReplyTos,
      }),
    },
    messageIds: {
      generateMailBundle: generateMailBundle.bind(null, {
        conversationId,
        knex,
        tableName: schemas.emailUtilsMessageIds,
        mailsDomain,
      }),
      insert: insertMessageId.bind(null, {
        conversationId,
        knex,
        tableName: schemas.emailUtilsMessageIds,
      }),
      list: listMessageIds.bind(null, {
        conversationId,
        knex,
        tableName: schemas.emailUtilsMessageIds,
      }),
    },
  });
}
