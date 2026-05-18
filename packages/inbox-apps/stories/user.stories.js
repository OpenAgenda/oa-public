import { http, HttpResponse } from 'msw';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app.js';

import StandardDecorator from './decorators/Standard.js';

import conversationFixtures from './fixtures/conversations.json' with { type: 'json' };
import conversationAuthorFixtures from './fixtures/author.json' with { type: 'json' };
import conversationMessagesFixtures from './fixtures/messages.json' with { type: 'json' };
import conversationUserContext from './fixtures/conversationUserContext.json' with { type: 'json' };

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = ({ apiRoot, context, res } = {}) => ({
  settings: {
    apiRoot,
    prefix: '',
    autoFocus: true,
    context,
  },
  res: {
    inboxHome: '/',
    author: '/user/author.json',
    conversations: {
      list: '/user/conversations',
      action: '/user/conversations/:conversationId/action/:code',
    },
    messages: {
      list: '/user/conversations/:conversationId/messages',
      create: '/user/conversations/:conversationId/messages',
      prepareAttachment:
        '/user/conversations/:conversationId/prepare-attachment',
      uploadAttachment: '/user/conversations/:conversationId/upload-attachment',
      addAttachment: '/user/conversations/:conversationId/add-attachment',
    },
    ...res ?? {},
  },
  inbox: {},
  conversation: {},
  modals: {},
});

export default {
  title: 'Integrated/Agenda Inbox',
  parameters: {
    msw: {
      handlers: [
        http.get('/user/conversations', () =>
          HttpResponse.json(conversationFixtures)),
        http.get('/user/author.json', () =>
          HttpResponse.json(conversationAuthorFixtures)),
        http.get('/user/conversations/:conversationId/messages', () =>
          HttpResponse.json(conversationMessagesFixtures)),
        http.get('/context/:identifier', () =>
          HttpResponse.json(conversationUserContext)),
      ],
    },
  },
  decorators: [StandardDecorator],
};

export function ConversationsList() {
  return wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState({
        apiRoot: '/',
        context: 'agenda',
      }),
    }),
    {
      extraProps: {
        lang: 'fr',
        agenda: {
          uid: 11317568,
          slug: 'calvados',
          title: 'Département du Calvados',
        },
        user: {
          uid: 123,
        },
      },
    },
  );
}

export function Conversation() {
  return wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: ['/conversation/123'],
      }),
      initialState: getDefaultState({
        apiRoot: '/',
        context: 'agenda',
      }),
    }),
    {
      extraProps: {
        lang: 'fr',
        agenda: {
          uid: 11317568,
          slug: 'calvados',
          title: 'Département du Calvados',
        },
        user: {
          uid: 123,
        },
      },
    },
  );
}

export function ConversationWithContext() {
  return wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: ['/conversation/123'],
      }),
      initialState: getDefaultState({
        apiRoot: '/',
        context: 'agenda',
        res: {
          conversations: {
            list: '/user/conversations',
            action: '/user/conversations/:conversationId/action/:code',
          },
          context: '/context/:identifier',
        },
      }),
    }),
    {
      extraProps: {
        lang: 'fr',
        agenda: {
          uid: 11317568,
          slug: 'calvados',
          title: 'Département du Calvados',
        },
        user: {
          uid: 123,
        },
      },
    },
  );
}
