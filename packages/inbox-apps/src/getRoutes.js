import React from 'react';
import { App, Inbox, Conversation, ConversationCreate } from './containers';

export default function ( prefix = '' ) {
  return [
    {
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: Inbox },
        { path: `${prefix}/conversation/create`, component: ConversationCreate },
        { path: `${prefix}/conversation/:conversationId`, component: Conversation },
        {
          component: ( { staticContext = {} } ) => {
            staticContext.status = 404;
            return null;
          }
        }
      ]
    }
  ];
};
