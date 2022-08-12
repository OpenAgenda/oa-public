import React from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import AgendaContextBar from '../src/components/AgendaContextBar';
import AgendaAdminModContextBar from '../src/components/AgendaAdminModContextBar';
import SimpleCanvas from './decorators/SimpleCanvas';
import IntlProvider from './decorators/IntlProvider';

import eventsResponse from './fixtures/events.response.json';
import draftsResponse from './fixtures/drafts.response.json';

export default {
  title: 'Agenda context bar',
  component: AgendaContextBar,
  decorators: [IntlProvider, SimpleCanvas]
};

export const AgendaAdminContextBar = () => (
  <AgendaAdminModContextBar
    res="/admin"
    states={[{
      key: -1,
      eventCount: 1
    }, {
      key: 1,
      eventCount: 2
    }, {
      key: 2,
      eventCount: 2
    }]}
  />
);

export const AgendaContributorContextBar = () => {
  const mock = new MockAdapter(axios);

  [
    'state[]=-1',
    'state[]=0&state[]=1',
    'state[]=2'
  ].map(s => `?${s}`).concat('').map(v => `/events${v}`).forEach(link => {
    mock.onGet(link).reply(200, eventsResponse);
  });

  mock.onGet('/drafts').reply(200, draftsResponse);

  return (
    <AgendaContextBar
      states={[{
        key: -1,
        eventCount: 1
      }, {
        key: 1,
        eventCount: 2
      }, {
        key: 2,
        eventCount: 2
      }]}
      drafts={2}
      res={{
        drafts: '/drafts',
        events: '/events',
        contribute: '/contribute'
      }}
      actions={{
        drafts: [{
          link: '/contribute/event/{event.uid}',
          label: 'Compléter'
        }],
        events: [{
          link: '/agendas/events/{event.uid}',
          label: 'Voir'
        }, {
          link: '/contribute/event/{event.uid}',
          label: 'Modifier'
        }]
      }}
    />
  );
};
