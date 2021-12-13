import { createMemoryHistory } from 'history';
import axios from 'axios';
import MockAdapter from '@openagenda/axios-mock-adapter';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app';
import PageDecorator from './decorators/PageDecorator';
import IntlDecorator from './decorators/IntlDecorator';
import sourcesJson from './mocks/sources.json';
import agendasJson from './mocks/agendas.json';
import agendaJson from './mocks/agenda.json';

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = ({ dev = {} } = {}) => ({
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
    getAgenda: '/agendas/:slug',
  },
  sources: {},
  modals: {},
  dev,
});

export default {
  title: 'Main',
  decorators: [PageDecorator, IntlDecorator],
};

export const Presentation = () => wrapApp(
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
  }
);

export const EmptyList = () => {
  const mock = new MockAdapter(axios);

  mock.onGet('/sources.json').reply(200, {
    sources: [],
    aggregator: {
      limit: 12,
    },
  });
  mock
    .onGet(/^\/([^/]+?)\/?admin\/aggregator$/)
    .reply(200, { agenda: agendasJson.agendas[0] });
  mock.onGet(/^\/([^/]+?)\/?$/).reply(200, { agenda: agendasJson.agendas[0] }); // /:slug

  return wrapApp(
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
    }
  );
};

export const List = () => {
  const mock = new MockAdapter(axios);

  mock.onGet('/sources.json').reply(200, sourcesJson);
  mock.onGet('/agendas.json').reply(200, agendasJson);
  mock
    .onGet(/^\/([^/]+?)\/?admin\/aggregator$/)
    .reply(200, { agenda: agendasJson.agendas[0] });
  mock.onGet(/^\/([^/]+?)\/?$/).reply(200, { agenda: agendasJson.agendas[0] }); // /:slug

  return wrapApp(
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
    }
  );
};

export const AddSourceModal = () => {
  const mock = new MockAdapter(axios);

  mock.onGet('/sources.json').reply(200, sourcesJson);
  mock.onGet('/agendas.json').reply(200, agendasJson);
  mock.onGet('/agendas/nouvelle-source').reply(200, agendaJson);
  mock
    .onGet('/nouvelle-source/settings/schema')
    .reply(200, { custom: {}, fields: [] });
  mock
    .onGet(/^\/([^/]+?)\/?admin\/aggregator$/)
    .reply(200, { agenda: agendasJson.agendas[0] });
  mock.onGet(/^\/([^/]+?)\/?$/).reply(200, { agenda: agendasJson.agendas[0] }); // /:slug
  mock.onPost('/:slug/admin/sources').reply(req => {
    console.log(req);
    return [200];
  });

  return wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: ['/la-gargouille/admin/sources'],
      }),
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
        agendaSchema: { custom: {}, fields: [] },
      },
    }
  );
};

export const EditSourceModal = () => {
  const mock = new MockAdapter(axios);

  mock.onGet('/sources.json').reply(req => {
    if (req.params.slug) {
      const source = sourcesJson.sources.filter(
        el => el.agenda.slug === req.params.slug
      );
      return [200, { sources: source }];
    }
    return [200, sourcesJson];
  });
  mock.onGet('/agendas.json').reply(200, agendasJson);
  mock
    .onGet('/amc-promotion/settings/schema')
    .reply(200, { custom: {}, fields: [] });
  mock
    .onGet(/^\/([^/]+?)\/?admin\/aggregator$/)
    .reply(200, { agenda: agendasJson.agendas[0] });
  mock.onGet(/^\/([^/]+?)\/?$/).reply(200, { agenda: agendasJson.agendas[0] }); // /:slug
  mock.onPut('/:slug/admin/sources/:sourceId').reply(req => {
    console.log(req);
    return [200];
  });

  return wrapApp(
    createApp({
      history: createMemoryHistory({
        initialEntries: ['/la-gargouille/admin/sources'],
      }),
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
        agendaSchema: { custom: {}, fields: [] },
      },
    }
  );
};
