import { rest } from 'msw';
import AgendaSearch from 'pages/agendas';
import AgendaSearchView from 'views/AgendasSearch';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import searchFixtures from './fixtures/search.json';
import networkFixtures from './fixtures/network.json';
import locationSetFixtures from './fixtures/locationSet.json';

export default {
  title: 'pages/agendas',
  component: AgendaSearch,
  loaders: [
    intlMessagesLoader(AgendaSearchView.fetchLocale),
  ],
  decorators: [
    ProvidersDecorator,
  ],
};

export const Search = {
  render: (_args, { loaded: { intlMessages } }) => (
    <AgendaSearch.Layout>
      <AgendaSearch intlMessages={intlMessages} />
    </AgendaSearch.Layout>
  ),
  parameters: {
    nextjs: {
      router: {
        asPath: '/agendas?search=Marche',
        query: {
          search: 'Marche',
        },
      },
    },
    msw: {
      handlers: [
        rest.get('/api/agendas', (req, res, ctx) => res(
          ctx.json(searchFixtures),
        )),
      ],
    },
  },
};

export const Network = {
  render: (_args, { loaded: { intlMessages } }) => (
    <AgendaSearch.Layout>
      <AgendaSearch intlMessages={intlMessages} />
    </AgendaSearch.Layout>
  ),
  parameters: {
    nextjs: {
      router: {
        asPath: '/agendas?network=34480426',
        query: {
          network: 34480426,
        },
      },
    },
    msw: {
      handlers: [
        rest.get('/api/agendas', (req, res, ctx) => res(
          ctx.json(networkFixtures),
        )),
      ],
    },
  },
};

export const LocationSet = {
  render: (_args, { loaded: { intlMessages } }) => (
    <AgendaSearch.Layout>
      <AgendaSearch intlMessages={intlMessages} />
    </AgendaSearch.Layout>
  ),
  parameters: {
    nextjs: {
      router: {
        asPath: '/agendas?locationSet=31515336',
        query: {
          locationSet: 31515336,
        },
      },
    },
    msw: {
      handlers: [
        rest.get('/api/agendas', (req, res, ctx) => res(
          ctx.json(locationSetFixtures),
        )),
      ],
    },
  },
};
