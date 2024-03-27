import { useState } from 'react';
import { rest } from 'msw';
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
        rest.get('/events', mswEventsMiddleware),
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
  const [value, setValue] = useState([91211851]);

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
