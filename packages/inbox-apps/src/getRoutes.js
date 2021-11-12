import React from 'react';
import { loadable } from '@openagenda/react-shared';

const App = loadable(() =>
  import(/* webpackChunkName: "inbox-App" */'./containers/App/App')
);
const Inbox = loadable(() =>
  import(/* webpackChunkName: "inbox-Inbox" */'./containers/Inbox/Inbox')
);
const Conversation = loadable(() =>
  import(/* webpackChunkName: "inbox-Conversation" */'./containers/Conversation/Conversation')
);
const ConversationCreate = loadable(() =>
  import(/* webpackChunkName: "inbox-ConversationCreate" */'./containers/ConversationCreate/ConversationCreate')
);

export default function (prefix = '') {
  return [
    {
      path: prefix,
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Inbox },
        { path: `${prefix}/conversation/create`, component: ConversationCreate },
        { path: `${prefix}/conversation/:conversationId`, component: Conversation }
      ]
    }
  ];
};
