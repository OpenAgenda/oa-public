import { createMemoryHistory } from 'history';
import { http, HttpResponse } from 'msw';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app.js';
import agendasJson from './fixtures/agendas.json';
import eventsJson from './fixtures/events.json';
import meJson from './fixtures/me.json';

import '@openagenda/bs-templates/compiled/main.css';
import ProvidersDecorator from './decorators/Providers.js';

const editedAgendasResponse = {
  ...agendasJson,
  agendas: agendasJson.agendas.concat([]),
};

function mswHandlers({ isNew = false } = {}) {
  return [
    http.get('/agendas.json', () =>
      HttpResponse.json(
        isNew
          ? {
            total: 0,
            agendas: [],
          }
          : editedAgendasResponse,
      )),
    http.get('/events.json', () => HttpResponse.json(eventsJson)),

    http.get('/agendas/:agendaUid/members/:userUid', ({ params }) => {
      const custom = editedAgendasResponse.agendas
        .filter((a) => a.uid === parseInt(params.agendaUid, 10))
        .pop().member?.custom;

      const member = {
        name: custom?.contactName,
        email: custom?.email,
      };

      return HttpResponse.json(member);
    }),

    http.delete('/agendas/:agendaUid/members/:userUid', ({ params }) => {
      const index = editedAgendasResponse.agendas.findIndex(
        (agenda) => agenda.uid === parseInt(params.agendaUid, 10),
      );

      if (index !== -1) {
        editedAgendasResponse.agendas.splice(index, 1);
      }

      return new HttpResponse(null, { status: 204 });
    }),

    http.get('/me/agendas/:agendaUid', () => HttpResponse.json(meJson)),
  ];
}

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

export const Welcome = {
  render() {
    return (
      <div>
        {wrapApp(
          createApp({
            history: createMemoryHistory(),
            initialState: getDefaultState({
              apiRoot: window.location.origin,
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
  },
  parameters: {
    msw: {
      handlers: mswHandlers({ isNew: true }),
    },
  },
};

export const HomeAgendas = {
  render() {
    return wrapApp(
      createApp({
        history: createMemoryHistory(),
        initialState: getDefaultState({
          apiRoot: window.location.origin,
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
  },
  parameters: {
    msw: {
      handlers: mswHandlers(),
    },
  },
};

export const HomeAgendasWithSearchQuery = {
  render() {
    return wrapApp(
      createApp({
        history: createMemoryHistory({ initialEntries: ['/?search=Paris'] }),
        initialState: getDefaultState({
          apiRoot: window.location.origin,
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
  },
  parameters: {
    msw: {
      handlers: mswHandlers(),
    },
  },
};

export const HomeAgendasWithOpenMemberEditModal = {
  render() {
    return wrapApp(
      createApp({
        history: createMemoryHistory({
          initialEntries: ['/agendas/member?agendaUid=87092762'],
        }),
        initialState: getDefaultState({
          apiRoot: window.location.origin,
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
  },
  parameters: {
    msw: {
      handlers: mswHandlers(),
    },
  },
};
