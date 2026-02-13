import { http, HttpResponse } from 'msw';
import AgendaShow from 'pages/[agendaSlug]';
import AgendaShowView from 'views/AgendaShow';
import { Agenda } from 'types';
import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';
import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventsFixtures from './fixtures/events.json';

export default {
  title: 'pages/[agendaSlug]/index',
  component: AgendaShow,
  loaders: [intlMessagesLoader(AgendaShowView.fetchLocale)],
  decorators: [ProvidersDecorator],
};

export const Sample = {
  render: (_args, { loaded: { intlMessages } }) => (
    <AgendaShow.Layout>
      <AgendaShow
        intlMessages={intlMessages}
        agenda={agendaFixtures as Agenda}
      />
    </AgendaShow.Layout>
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
  render: (_args, { loaded: { intlMessages } }) => (
    <AgendaShow.Layout>
      <AgendaShow
        intlMessages={intlMessages}
        agenda={agendaFixtures as Agenda}
      />
    </AgendaShow.Layout>
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
  render: (_args, { loaded: { intlMessages } }) => (
    <AgendaShow.Layout>
      <AgendaShow
        intlMessages={intlMessages}
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
    </AgendaShow.Layout>
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
