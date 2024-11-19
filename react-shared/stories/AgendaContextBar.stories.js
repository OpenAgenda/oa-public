import { http, HttpResponse } from 'msw';

import AgendaContextBar from '../src/components/AgendaContextBar.js';
import AgendaAdminModContextBar from '../src/components/AgendaAdminModContextBar.js';
import SimpleCanvas from './decorators/SimpleCanvas.js';
import IntlProvider from './decorators/IntlProvider.js';

import eventsResponse from './fixtures/events.response.json';
import manyEventsResponse from './fixtures/manyEvents.response.json';
import draftsResponse from './fixtures/drafts.response.json';

const mswHandlers = {
  basicEvents: http.get('/events', () => HttpResponse.json(eventsResponse)),
  manyEvents: http.get('/events', ({ request }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    return HttpResponse.json(
      manyEventsResponse[offset === '20' ? 'from20' : 'from0'],
    );
  }),
  drafts: http.get('/drafts', () => HttpResponse.json(draftsResponse)),
};

export default {
  title: 'Agenda context bar',
  component: AgendaContextBar,
  decorators: [IntlProvider, SimpleCanvas],
};

export const AgendaAdminContextBar = () => (
  <AgendaAdminModContextBar
    res="/admin"
    states={[
      {
        key: -1,
        eventCount: 1,
      },
      {
        key: 1,
        eventCount: 2,
      },
      {
        key: 2,
        eventCount: 2,
      },
    ]}
  />
);

export const AgendaContributorContextBar = {
  render: () => (
    <AgendaContextBar
      states={[
        {
          key: -1,
          eventCount: 1,
        },
        {
          key: 1,
          eventCount: 2,
        },
        {
          key: 2,
          eventCount: 2,
        },
      ]}
      drafts={2}
      res={{
        drafts: '/drafts',
        events: '/events',
        contribute: '/contribute',
      }}
      actions={{
        drafts: [
          {
            link: '/contribute/event/{event.uid}',
            label: 'Compléter',
          },
        ],
        events: [
          {
            link: '/agendas/events/{event.uid}',
            label: 'Voir',
          },
          {
            link: '/contribute/event/{event.uid}',
            label: 'Modifier',
          },
        ],
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [mswHandlers.basicEvents, mswHandlers.drafts],
    },
  },
};

export const AgendaContributorEmptyContextBar = () => (
  <AgendaContextBar
    states={[]}
    drafts={0}
    res={{
      drafts: '/drafts',
      events: '/events',
      contribute: '/contribute',
    }}
    actions={{
      drafts: [
        {
          link: '/contribute/event/{event.uid}',
          label: 'Compléter',
        },
      ],
      events: [
        {
          link: '/agendas/events/{event.uid}',
          label: 'Voir',
        },
        {
          link: '/contribute/event/{event.uid}',
          label: 'Modifier',
        },
      ],
    }}
  />
);

export const AgendaContributorContextBarWithPagination = {
  render: () => (
    <AgendaContextBar
      states={[
        {
          key: -1,
          eventCount: 1,
        },
        {
          key: 1,
          eventCount: 2,
        },
        {
          key: 2,
          eventCount: 2,
        },
      ]}
      drafts={2}
      res={{
        drafts: '/drafts',
        events: '/events',
        contribute: '/contribute',
      }}
      actions={{
        drafts: [
          {
            link: '/contribute/event/{event.uid}',
            label: 'Compléter',
          },
        ],
        events: [
          {
            link: '/agendas/events/{event.uid}',
            label: 'Voir',
          },
          {
            link: '/contribute/event/{event.uid}',
            label: 'Modifier',
          },
        ],
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [mswHandlers.manyEvents, mswHandlers.drafts],
    },
  },
};
