import _ from 'lodash';

import Inbox from './Inbox.js';
import InboxUsers from './InboxUsers.js';
import InboxUser from './InboxUser.js';
import Conversations from './Conversations.js';
import Conversation from './Conversation.js';
import Messages from './Messages.js';
import Message from './Message.js';
import EmailUtils from './EmailUtils/index.js';
import * as tasks from './tasks/index.js';
import makeConfig from './config.js';

export default async function createService(conf) {
  const config = await makeConfig(conf);

  const { createWorker, knex, schemas, mailsDomain } = config;

  const svc = {};

  const syncMethods = {
    syncUser: tasks.sync.syncUser.bind(null, svc),
    syncAgenda: tasks.sync.syncAgenda.bind(null, svc),
  };

  const worker = createWorker((job) => {
    switch (job.name) {
      case 'syncUser':
        syncMethods.syncUser(job.data);
        break;
      case 'syncAgenda':
        syncMethods.syncAgenda(job.data);
        break;
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  });

  worker.on('error', (failedReason) => console.error('error', failedReason));

  Object.assign(svc, {
    config,
    Inbox: Inbox.bind(null, svc),
    InboxUsers: InboxUsers.bind(null, svc),
    InboxUser: InboxUser.bind(null, svc),
    Conversations: Conversations.bind(null, svc),
    Conversation: Conversation.bind(null, svc),
    Messages: Messages.bind(null, svc),
    Message: Message.bind(null, svc),
    tasks: {
      sync: Object.assign(tasks.sync.default.bind(null, svc), syncMethods),
    },
    emailUtils: EmailUtils({
      knex,
      schemas: _.pick(schemas, ['emailUtilsMessageIds', 'emailUtilsReplyTos']),
      mailsDomain,
    }),
    worker,
  });

  // bind statics
  svc.Inbox.user = Inbox.user.bind(null, svc);
  svc.Conversation.link = Conversation.link.bind(null, svc);
  svc.Conversation.unlink = Conversation.unlink.bind(null, svc);

  return svc;
}
