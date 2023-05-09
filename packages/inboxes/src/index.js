import Inbox from './Inbox';
import InboxUsers from './InboxUsers';
import InboxUser from './InboxUser';
import Conversations from './Conversations';
import Conversation from './Conversation';
import Messages from './Messages';
import Message from './Message';
import * as tasks from './tasks';
import makeConfig from './config';

export default async function createService(conf) {
  const config = await makeConfig(conf);

  const {
    queue,
  } = config;

  const svc = {};

  const syncMethods = {
    syncUser: tasks.sync.syncUser.bind(null, svc),
    syncAgenda: tasks.sync.syncAgenda.bind(null, svc),
  };

  if (queue) {
    queue.register(syncMethods);
  }

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
  });

  // bind statics
  svc.Inbox.user = Inbox.user.bind(null, svc);
  svc.Conversation.link = Conversation.link.bind(null, svc);
  svc.Conversation.unlink = Conversation.unlink.bind(null, svc);

  return svc;
}
