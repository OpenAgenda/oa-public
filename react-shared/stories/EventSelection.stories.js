import { http, HttpResponse } from 'msw';

import EventSelection from '../src/components/EventSelection.js';
import SimpleCanvas from './decorators/SimpleCanvas.js';
import IntlProvider from './decorators/IntlProvider.js';

import eventsResponse from './fixtures/events.response.json';
import manyEventsResponse from './fixtures/manyEvents.response.json';

const mswHandlers = {
  basicEvents: http.get('/events', () => HttpResponse.json(eventsResponse)),
  manyEvents: http.get('/events', ({ request }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    return HttpResponse.json(
      manyEventsResponse[offset === '20' ? 'from20' : 'from0'],
    );
  }),
};

export default {
  title: 'Event Selection',
  component: EventSelection,
  decorators: [IntlProvider, SimpleCanvas],
};

export const Simple = {
  render: () => (
    <div className="col-xs-10 col-xs-offset-1 col-md-6 col-md-offset-3 wsq">
      <EventSelection
        title="Mes événements"
        info="Il faut faire un peu attention à ce qu'il y a écrit ici."
        infoType="warning"
        res="/events"
        agenda={{
          uid: 1234,
        }}
        actions={[
          {
            link: '/agendas/{agenda.uid}/events/{event.uid}',
            label: 'Voir',
          },
        ]}
      />
    </div>
  ),
  parameters: {
    msw: {
      handlers: [mswHandlers.basicEvents],
    },
  },
};

export const WithPagination = {
  render: () => (
    <div className="col-xs-10 col-xs-offset-1 col-md-6 col-md-offset-3 wsq">
      <EventSelection
        title="Mes événements"
        info="Il faut faire un peu attention à ce qu'il y a écrit ici."
        infoType="warning"
        res="/events"
        agenda={{
          uid: 1234,
        }}
        actions={[
          {
            link: '/agendas/{agenda.uid}/events/{event.uid}',
            label: 'Voir',
          },
        ]}
      />
    </div>
  ),
  parameters: {
    msw: {
      handlers: [mswHandlers.manyEvents, mswHandlers.drafts],
    },
  },
};
