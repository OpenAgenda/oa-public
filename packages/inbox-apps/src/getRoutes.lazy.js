import React from 'react';
import loadable from '@openagenda/react-utils/dist/loadable';
import Spinner from '@openagenda/react-components/build/Spinner';

const Loading = (
  <div
    className="text-center margin-top-lg"
    style={{
      minHeight: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Spinner
      mode="inline"
      options={{
        scale: 1,
        width: 1
      }}
    />
  </div>
);

const App = loadable(() =>
  import(/* webpackChunkName: "inbox-App" */'./containers/App/App'),
  { fallback: Loading }
);
const Inbox = loadable(() =>
  import(/* webpackChunkName: "inbox-Inbox" */'./containers/Inbox/Inbox'),
  { fallback: Loading }
);
const Conversation = loadable(() =>
  import(/* webpackChunkName: "inbox-Conversation" */'./containers/Conversation/Conversation'),
  { fallback: Loading }
);
const ConversationCreate = loadable(() =>
  import(/* webpackChunkName: "inbox-ConversationCreate" */'./containers/ConversationCreate/ConversationCreate'),
  { fallback: Loading }
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
