import '@openagenda/bs-templates/compiled/main.css';
import { http, HttpResponse } from 'msw';
import { createMemoryHistory } from 'history';

import React from 'react';
import App from '../client/src/App.js';

import {
  networks
} from './fixtures.json';

export default { title: 'App' };

export const listOfNetworks = {
  render: () => {
  return <App
    createHistory={createMemoryHistory}
    base=""
    lang="fr"
  />
  },
  parameters: {
    msw: {
      handlers: [
        http.get('', () => HttpResponse.json(networks)),
        http.get('/networks/:networkUid/agendas', () => HttpResponse.json({
          network: networks[0],
          agendas: networks[0].agendas,
        })),
        http.post('/networks/:networkUid/agendas/remove/:agendaUid', () => HttpResponse.json(networks[0].agendas[0])),
        http.post('/networks/:networkUid/agendas/add', () => HttpResponse.json({
          uid: 1230902,
          title: 'Bim!',
        })),
      ],
    },
  },
}
