import _ from 'lodash';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';

import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app';
import agendasJson from './mocks/agendas.json';
import eventsJson from './mocks/events.json';
import meJson from './mocks/me.json';

import '@openagenda/bs-templates/compiled/main.css';
import ProvidersDecorator from './decorators/Providers';

const editedAgendasResponse = {
  ...agendasJson,
  agendas: agendasJson.agendas.concat([]),
};

function route(path = '') {
  console.log(
    path,
    typeof path === 'string'
      ? new RegExp(path.replace(/:\w+/g, '[^/]+'))
      : path,
  );
  return typeof path === 'string'
    ? new RegExp(path.replace(/:\w+/g, '[^/]+'))
    : path;
}

const mswHandlers = {
  newAgenda: rest.get('/agendas.json', async (_req, res, ctx) => res(
    ctx.status(200),
    ctx.json({ total: 0, agendas: [], isMember: false }),
  )),
  editedAgenda: rest.get('/agendas.json', async (_req, res, ctx) => res(ctx.status(200), ctx.json(editedAgendasResponse))),
  events: rest.get('/events.json', async (_req, res, ctx) => res(ctx.status(200), ctx.json(eventsJson))),
  me: rest.get(route('me/agendas/:agendaUid'), async (_req, res, ctx) => res(ctx.status(200), ctx.json(meJson))),
  getMemberAgenda: rest.get(
    route('/agendas/:agendaUid/members/:userUid'),
    async (req, res, ctx) => {
      const [, , , , agendaUid] = req.url.href.split('/');

      const custom = editedAgendasResponse.agendas
        .filter(a => a.uid === parseInt(agendaUid, 10))
        .pop().member?.custom;

      const member = {
        name: custom?.contactName,
        email: custom?.email,
        // ...
      };
      return res(ctx.status(200), ctx.json(member));
    },
  ),
  deleteMember: rest.delete(
    route('/agendas/:agendaUid/members/:userUid'),
    async (req, res, ctx) => {
      const [, , , , agendaUid] = req.url.href.split('/');

      const index = _.findIndex(
        editedAgendasResponse.agendas,
        agenda => agenda.uid === parseInt(agendaUid, 10),
      );

      editedAgendasResponse.agendas.splice(index, 1);
      return res(ctx.status(204));
    },
  ),
};

const getDefaultState = () => ({
  settings: {
    apiRoot: '',
    prefix: '',
    perPageLimit: 20,
    displayLegacyMessageTab: false,
  },
  res: {
    agendas: {
      contribute: '/:slug/contribute',
      create: '/agendas/new',
      list: '/agendas.json',
      show: '/:slug',
      showPrivate: '/:slug.prv',
      addEvent: '/:slug/addevent',
      contact: '/:slug/contact',
      get: 'me/agendas/:agendaUid',
    },
    events: {
      list: '/events.json',
      show: '/:slug/events/:eventSlug',
      edit: '/:slug/contribute/event/:eventUid',
      showPrivate: '/:slug/events/:eventSlug.prv',
      showWithoutAgenda: '/events/:eventSlug',
    },
    members: '/agendas/:agendaUid/members',
    messages: '/home/messages',
    notifs: '/home/notifications',
    search: '/agendas',
    memberSchema: '/',
  },
  menu: {
    tab: 'agendas',
  },
});

export default {
  title: 'Main',
  decorators: [ProvidersDecorator],
};

export const Welcome = {
  render: () => (
    <div>
      {wrapApp(
        createApp({
          history: createMemoryHistory(),
          initialState: getDefaultState(),
        }),
        {
          extraProps: {
            user: {
              id: 2,
              uid: 99999999,
              isNew: true,
            },
            lang: 'fr',
          },
        },
      )}
    </div>
  ),
  parameters: {
    msw: {
      handlers: [mswHandlers.newAgenda],
    },
  },
};

export const HomeAgendas = {
  render: () => wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState(),
    }),
    {
      extraProps: {
        user: {
          id: 2,
          uid: 99999999,
          isNew: false,
        },
        lang: 'fr',
      },
    },
  ),
  parameters: {
    msw: {
      handlers: [
        mswHandlers.editedAgenda,
        mswHandlers.deleteMember,
        mswHandlers.events,
        mswHandlers.me,
        mswHandlers.getMemberAgenda,
      ],
    },
  },
};

export const HomeAgendasWithSearchQuery = {
  render: () => wrapApp(
    createApp({
      history: createMemoryHistory({ initialEntries: ['/?search=Paris'] }),
      initialState: getDefaultState(),
    }),
    {
      extraProps: {
        user: {
          id: 2,
          uid: 99999999,
          isNew: false,
        },
        lang: 'fr',
      },
    },
  ),
  parameters: {
    msw: {
      handlers: [
        mswHandlers.editedAgenda,
        mswHandlers.deleteMember,
        mswHandlers.events,
        mswHandlers.me,
        mswHandlers.getMemberAgenda,
      ],
    },
  },
};

export const HomeAgendasWithOpenMemberEditModal = {
  render: () => wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: ['/agendas/member?agendaUid=87092762'],
      }),
      initialState: getDefaultState(),
    }),
    {
      extraProps: {
        user: {
          id: 2,
          uid: 99999999,
          isNew: false,
        },
        lang: 'fr',
      },
    },
  ),
  parameters: {
    msw: {
      handlers: [
        mswHandlers.editedAgenda,
        mswHandlers.deleteMember,
        mswHandlers.events,
        mswHandlers.me,
        mswHandlers.getMemberAgenda,
      ],
    },
  },
};
