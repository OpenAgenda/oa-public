import { http, HttpResponse } from 'msw';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app.js';
import PageDecorator from './decorators/PageDecorator.js';
import IntlDecorator from './decorators/IntlDecorator.js';
import sourcesJson from './fixtures/sources.json' with { type: 'json' };
import agendasJson from './fixtures/agendas.json' with { type: 'json' };

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = ({ dev = {}, res = {} } = {}) => ({
  settings: {
    prefix: '/:slug/admin/sources',
    perPageLimit: 20,
  },
  res: {
    list: '/sources.json',
    add: '/:slug/admin/sources',
    update: '/:slug/admin/sources/:sourceId',
    show: '#',
    remove: '/remove',
    search: '#',
    agendaSearch: '/agendas.json',
    slugSearch: '/:slug',
    getAggregator: '/:slug/admin/aggregator',
    setAggregator: '/:slug/admin/aggregator',
    getAgenda: '/api/agendas/slug/:slug',
    ...res,
  },
  sources: {},
  modals: {},
  dev,
});

export default {
  title: 'Main',
  decorators: [PageDecorator, IntlDecorator],
  parameters: {
    msw: {
      handlers: [
        http.get('/empty-sources', () => HttpResponse.json({ sources: [] })),
        http.get('/non-empty-sources', () => HttpResponse.json(sourcesJson)),
        http.get('/existing-aggregator', () =>
          HttpResponse.json({ agenda: agendasJson.agendas[0] })),
      ],
    },
  },
};

export const Presentation = () =>
  wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState(),
    }),
    {
      extraProps: {
        lang: 'fr',
        agenda: {
          uid: 48959239,
          slug: 'la-gargouille',
          title: 'La gargouille',
          credentials: {
            aggregator: true,
          },
        },
      },
    },
  );

export const EmptyList = () =>
  wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState({
        res: {
          list: '/empty-sources',
          getAggregator: '/existing-aggregator',
        },
      }),
    }),
    {
      extraProps: {
        lang: 'fr',
        agenda: {
          uid: 48959239,
          slug: 'la-gargouille',
          title: 'La gargouille',
          credentials: {
            aggregator: true,
          },
        },
      },
    },
  );

export const List = () =>
  wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: ['/la-gargouille/admin/sources'],
      }),
      initialState: getDefaultState({
        res: {
          list: '/non-empty-sources',
          getAggregator: '/existing-aggregator',
        },
      }),
    }),
    {
      extraProps: {
        lang: 'fr',
        agenda: {
          uid: 48959239,
          slug: 'la-gargouille',
          title: 'La gargouille',
          credentials: {
            aggregator: true,
          },
        },
      },
    },
  );
