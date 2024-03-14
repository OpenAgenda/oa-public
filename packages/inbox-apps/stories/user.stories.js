import { rest } from 'msw';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app';

import conversationFixtures from './fixtures/conversations.json';
import conversationAuthorFixtures from './fixtures/author.json';
import conversationMessagesFixtures from './fixtures/messages.json';

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = ({ apiRoot, context } = {}) => ({
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
      ],
    },
  },
};

export function ConversationsList() {
  const element = wrapApp(
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
}
