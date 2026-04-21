import { http, HttpResponse } from 'msw';
import AgendaShow from '@/src/app/[locale]/(app)/[agendaSlug]/_components/AgendaShow';
import AppLayout from 'components/Layout';
import { Agenda } from 'types';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import fetchLocale from '../../utils/fetchLocale';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventsFixtures from './fixtures/events.json';

export default {
  title: 'app/[agendaSlug]',
  component: AgendaShow,
  loaders: [intlMessagesLoader(fetchLocale)],
  decorators: [ProvidersDecorator],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/fr/metropole-europeenne-de-lille',
      },
    },
  },
};

export const Sample = {
  render: () => (
    <AppLayout>
      <AgendaShow agenda={agendaFixtures as Agenda} />
    </AppLayout>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get('/api/agendas/slug/metropole-europeenne-de-lille/events', () =>
          HttpResponse.json(eventsFixtures),
        ),
      ],
    },
  },
};

export const NetworkError = {
  render: () => (
    <AppLayout>
      <AgendaShow agenda={agendaFixtures as Agenda} />
    </AppLayout>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get('/api/agendas/slug/metropole-europeenne-de-lille/events', () =>
          HttpResponse.error(),
        ),
      ],
    },
  },
};

export const CustomFilterSelection = {
  render: () => (
    <AppLayout>
      <AgendaShow
        agenda={
          {
            ...agendaFixtures,
            settings: {
              ...agendaFixtures.settings,
              public: {
                filters: {
                  displayed: ['timings', 'categories-metropolitaines'],
                },
              },
            },
          } as Agenda
        }
      />
    </AppLayout>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get('/api/agendas/slug/metropole-europeenne-de-lille/events', () =>
          HttpResponse.json(eventsFixtures),
        ),
      ],
    },
  },
};
