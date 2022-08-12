import React from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import EventSelection from '../src/components/EventSelection';
import SimpleCanvas from './decorators/SimpleCanvas';
import IntlProvider from './decorators/IntlProvider';

import eventsResponse from './fixtures/events.response.json';

export default {
  title: 'Event Selection',
  component: EventSelection,
  decorators: [IntlProvider, SimpleCanvas]
};

export const Simple = () => {
  const mock = new MockAdapter(axios);
  mock.onGet('/events').reply(200, eventsResponse);

  return (
    <div className="col-xs-10 col-xs-offset-1 col-md-6 col-md-offset-3 wsq">
      <EventSelection
        title="Mes événements"
        info="Il faut faire un peu attention à ce qu'il y a écrit ici."
        infoType="warning"
        res="/events"
        agenda={{
          uid: 1234
        }}
        actions={[{
          link: '/agendas/{agenda.uid}/events/{event.uid}',
          label: 'Voir'
        }]}
      />
    </div>
  );
};
