import { http, HttpResponse } from 'msw';
import AgendasSearch from 'app/agendas/_components/AgendasSearch';
import AppLayout from 'components/app/Layout';
import fetchLocale from 'app/locales';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import searchFixtures from '../../pages/agendas/fixtures/search.json';
import networkFixtures from '../../pages/agendas/fixtures/network.json';
import locationSetFixtures from '../../pages/agendas/fixtures/locationSet.json';

export default {
  title: 'app/agendas',
  component: AgendasSearch,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/agendas',
      },
    },
  },
};

export const Search = {
  render: () => (
    <AppLayout>
      <AgendasSearch
        initialAgendas={searchFixtures}
        network={null}
        locationSet={null}
        query={{ search: 'Marche' }}
        locale="fr"
      />
    </AppLayout>
  ),
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/agendas',
        query: { search: 'Marche' },
      },
    },
    msw: {
      handlers: [
        http.get('/api/agendas', () => HttpResponse.json(searchFixtures)),
      ],
    },
  },
};

export const Network = {
  render: () => (
    <AppLayout>
      <AgendasSearch
        initialAgendas={networkFixtures}
        network={{ uid: 34480426, title: 'Grand Châtellerault' }}
        locationSet={null}
        query={{ network: '34480426' }}
        locale="fr"
      />
    </AppLayout>
  ),
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/agendas',
        query: { network: '34480426' },
      },
    },
    msw: {
      handlers: [
        http.get('/api/agendas', () => HttpResponse.json(networkFixtures)),
      ],
    },
  },
};

export const LocationSet = {
  render: () => (
    <AppLayout>
      <AgendasSearch
        initialAgendas={locationSetFixtures}
        network={null}
        locationSet={{ uid: 31515336, title: '1001 Notes' }}
        query={{ locationSet: '31515336' }}
        locale="fr"
      />
    </AppLayout>
  ),
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/agendas',
        query: { locationSet: '31515336' },
      },
    },
    msw: {
      handlers: [
        http.get('/api/agendas', () => HttpResponse.json(locationSetFixtures)),
      ],
    },
  },
};
