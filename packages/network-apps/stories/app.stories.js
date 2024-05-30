import '@openagenda/bs-templates/compiled/main.css';
import { rest } from 'msw';
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
        rest.get('', (_req, res, ctx) => res( ctx.status(200),
          ctx.json(networks),
        )),
        rest.get(/^\/networks\/[0-9]\/agendas$/, (_req, res, ctx) => res( ctx.status(200),
          ctx.json({
            network: networks[0],
            agendas: networks[0].agendas
          })
        )),
        rest.post(/^\/networks\/[0-9]\/agendas\/remove\/[0-9]+$/, (_req, res, ctx) => res(ctx.status(200), ctx.json(networks[0].agendas[0]))),
        rest.post(/^\/networks\/[0-9]\/agendas\/add$/, (_req, res, ctx) => res(ctx.status(200), ctx.json({
          uid: 1230902,
          title: 'Bim!'
        })))
      ],
    },
  },
}
