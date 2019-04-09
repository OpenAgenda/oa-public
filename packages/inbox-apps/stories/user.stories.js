import React from 'react';
import { createMemoryHistory } from 'history';
import { storiesOf } from '@storybook/react';
import createApp from '../src/apps/inbox';

import '@openagenda/bs-templates/compiled/main.css';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ( { lang = 'fr', apiRoot } = {} ) => ({
  settings: {
    lang,
    apiRoot,
    prefix: '',
    autoFocus: true
  },
  res: {
    inboxHome: '/',
    author: '/user/author.json',
    conversations: {
      list: '/user/conversations',
      action: '/user/conversations/:conversationId/action/:code'
    },
    messages: {
      list: '/user/conversations/:conversationId/messages',
      create: '/user/conversations/:conversationId/messages',
      prepareAttachment: '/user/conversations/:conversationId/prepare-attachment',
      addAttachment: '/user/conversations/:conversationId/add-attachment',
    }
  }
});


storiesOf( 'App', module )
  .add( 'all', () => {
    const { element, triggerHooks } = createApp( {
      history: createMemoryHistory(),
      initialState: getDefaultState( { apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}` } )
    } );

    triggerHooks();

    return (
      <div className="container top-margined">
        <div className="row wsq">
          <div className="margin-all-sm">
            <div className="inbox inbox-user">
              {element}
            </div>
          </div>
        </div>
      </div>
    );
  } );
