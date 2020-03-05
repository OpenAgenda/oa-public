import Inbox from './Inbox';
import InboxUsers from './InboxUsers';
import InboxUser from './InboxUser';
import Conversations from './Conversations';
import Conversation from './Conversation';
import * as tasks from './tasks';
import makeConfig from './config';

export default async function createService(conf) {
  const config = await makeConfig(conf);

  const svc = {
    config,
    Inbox: Inbox.bind(null, config),
    InboxUsers: InboxUsers.bind(null, config),
    InboxUser: InboxUser.bind(null, config),
    Conversations: Conversations.bind(null, config),
    Conversation: Conversation.bind(null, config),
    tasks: {
      sync: Object.assign(tasks.sync.default.bind(null, config), {
        syncTask: tasks.sync.default.bind(null, config),
        defineJob: tasks.sync.defineJob.bind(null, config),
        processJob: tasks.sync.processJob.bind(null, config),
        syncUser: tasks.sync.syncUser.bind(null, config),
        syncAgenda: tasks.sync.syncAgenda.bind(null, config)
      })
    }
  };

  // bind statics
  svc.Inbox.user = Inbox.user.bind(null, config);
  svc.Conversation.link = Conversation.link.bind(null, config);
  svc.Conversation.unlink = Conversation.unlink.bind(null, config);

  return svc;
};
