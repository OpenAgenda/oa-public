import NotFound from '@openagenda/react-utils/dist/NotFound';
import { App, Inbox, Conversation, ConversationCreate } from './containers';

export default function ( prefix = '' ) {
  return [
    {
      route: prefix,
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Inbox },
        { path: `${prefix}/conversation/create`, component: ConversationCreate },
        { path: `${prefix}/conversation/:conversationId`, component: Conversation },
        { component: NotFound }
      ]
    }
  ];
};
