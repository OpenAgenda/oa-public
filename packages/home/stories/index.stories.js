import _ from 'lodash';
import { createMemoryHistory } from 'history';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
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

const mock = new MockAdapter(axios);

function route(path = '') {
  return typeof path === 'string'
    ? new RegExp(path.replace(/:\w+/g, '[^/]+'))
    : path;
}

const mockApi = ({ isNew } = {}) => {
  mock.onGet('/agendas.json').reply(
    200,
    isNew
      ? {
        total: 0,
        agendas: [],
        isMember: false,
      }
      : editedAgendasResponse,
  );
  mock.onGet('/events.json').reply(200, eventsJson);

  mock.onGet(route('/agendas/:agendaUid/members/:userUid')).reply(req => {
    const [, , agendaUid] = req.url.split('/');

    const custom = editedAgendasResponse.agendas
      .filter(a => a.uid === parseInt(agendaUid, 10))
      .pop().member?.custom;

    const member = {
      name: custom?.contactName,
      email: custom?.email,
      // ...
    };

    return [200, member];
  });

  mock.onDelete(route('/agendas/:agendaUid/members/:userUid')).reply(req => {
    const [, , agendaUid] = req.url.split('/');

    const index = _.findIndex(
      editedAgendasResponse.agendas,
      agenda => agenda.uid === parseInt(agendaUid, 10),
    );

    editedAgendasResponse.agendas.splice(index, 1);

    return [204];
  });
};

mock.onGet(route('me/agendas/:agendaUid')).reply(200, meJson);

const getHostname = () =>
  (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ({ apiRoot } = {}) => ({
  settings: {
    apiRoot,
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

export const Welcome = () => {
  mockApi({
    isNew: true,
  });

  return (
    <div>
      {wrapApp(
        createApp({
          history: createMemoryHistory(),
          initialState: getDefaultState({
            apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_PORT}`,
          }),
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
  );
};

export const HomeAgendas = () => {
  mockApi();

  return wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState({
        apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_PORT}`,
      }),
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
  );
};

export const HomeAgendasWithSearchQuery = () => {
  mockApi();

  return wrapApp(
    createApp({
      history: createMemoryHistory({ initialEntries: ['/?search=Paris'] }),
      initialState: getDefaultState({
        apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_PORT}`,
      }),
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
  );
};

export const HomeAgendasWithOpenMemberEditModal = () => {
  mockApi();

  return wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: ['/agendas/member?agendaUid=87092762'],
      }),
      initialState: getDefaultState({
        apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_PORT}`,
      }),
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
  );
};
