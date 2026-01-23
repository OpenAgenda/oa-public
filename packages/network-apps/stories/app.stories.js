import '@openagenda/bs-templates/compiled/main.css';
import { http, HttpResponse } from 'msw';
import { createMemoryHistory } from 'history';
import App from '../client/src/App.js';

import fixtures from './fixtures.json' with { type: 'json' };

const { networks } = fixtures;

export default { title: 'App' };

export const listOfNetworks = {
  render: () => <App createHistory={createMemoryHistory} base="" lang="fr" />,
  parameters: {
    msw: {
      handlers: [
        http.get('', () => HttpResponse.json(networks)),
        http.get('/networks/:networkUid/agendas', () =>
          HttpResponse.json({
            network: networks[0],
            agendas: networks[0].agendas,
          })),
        http.post('/networks/:networkUid/agendas/remove/:agendaUid', () =>
          HttpResponse.json(networks[0].agendas[0])),
        http.post('/networks/:networkUid/agendas/add', () =>
          HttpResponse.json({
            uid: 1230902,
            title: 'Bim!',
          })),
      ],
    },
  },
};
