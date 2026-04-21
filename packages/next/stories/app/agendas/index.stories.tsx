import { http, HttpResponse } from 'msw';
import AgendasSearch from '@/src/app/[locale]/(app)/agendas/_components/AgendasSearch';
import AppLayout from 'components/Layout';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import fetchLocale from '../../utils/fetchLocale';
import searchFixtures from './fixtures/search.json';
import networkFixtures from './fixtures/network.json';
import locationSetFixtures from './fixtures/locationSet.json';

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
