import { rest } from 'msw';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app';

import StandardDecorator from './decorators/Standard';

import conversationFixtures from './fixtures/conversations.json';
import conversationAuthorFixtures from './fixtures/author.json';
import conversationMessagesFixtures from './fixtures/messages.json';
import conversationUserContext from './fixtures/conversationUserContext.json';

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
      prepareAttachment: '/user/conversations/:conversationId/prepare-attachment',
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
        rest.get('/user/conversations', (req, res, ctx) => res(
          ctx.json(conversationFixtures),
        )),
        rest.get('/user/author.json', (req, res, ctx) => res(
          ctx.json(conversationAuthorFixtures),
        )),
        rest.get('/user/conversations/:conversationId/messages', (req, res, ctx) => res(
          ctx.json(conversationMessagesFixtures),
        )),
        rest.get('/context/:identifier', (req, res, ctx) => res(
          ctx.json(conversationUserContext),
        )),
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
