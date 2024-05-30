import { useState } from 'react';
import { http, HttpResponse } from 'msw';
import '@openagenda/bs-templates/compiled/main.css';

import EventsAdditionalFieldComponent from '../src/components/Events';

import Providers from './decorators/Providers';
import StandardCanvas from './decorators/StandardCanvas';
import mswEventsMiddleware from './mswEventsMiddleware';

export default {
  title: 'Components / Events',
  decorators: [Providers, StandardCanvas],
  parameters: {
    msw: {
      handlers: [
        http.get('/events', mswEventsMiddleware),
        http.get('/no-events', () => HttpResponse.json({ events: [], total: 0 })),
      ],
    },
  },
};

export const Empty = () => (
  <div className="wsq padding-v-xs padding-h-sm">
    <EventsAdditionalFieldComponent
      field={{ res: '/events' }}
      lang="fr"
      onChange={() => {}}
    />
  </div>
);

export const WithSelectedEvents = () => {
  const [value, setValue] = useState([91211851, 43628849, 46624658]);

  return (
    <div className="wsq padding-v-xs padding-h-sm">
      <EventsAdditionalFieldComponent
        field={{ res: '/events' }}
        lang="fr"
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

export const WithNoResults = () => (
  <div className="wsq padding-v-xs padding-h-sm">
    <EventsAdditionalFieldComponent
      field={{ res: '/no-events' }}
      lang="fr"
      value={null}
      onChange={() => {}}
    />
  </div>
);
