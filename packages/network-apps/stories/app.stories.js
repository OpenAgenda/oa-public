import '@openagenda/bs-templates/compiled/main.css';
import axios from 'axios';
import { createMemoryHistory } from 'history';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import App from '../client/src/App.js';

import {
  networks
} from './fixtures.json';

const mock = new MockAdapter(axios);

export default { title: 'App' };

export const listOfNetworks = () => {
  mock.onGet('').reply(200, networks);
  mock.onGet(/^\/networks\/[0-9]\/agendas$/).reply(200, {
    network: networks[0],
    agendas: networks[0].agendas
  });
  mock.onPost(/^\/networks\/[0-9]\/agendas\/remove\/[0-9]+$/).reply(200, networks[0].agendas[0]);
  mock.onPost(/^\/networks\/[0-9]\/agendas\/add$/).reply(200, {
    uid: 1230902,
    title: 'Bim!'
  });

  return <App
    createHistory={createMemoryHistory}
    base=""
    lang="fr"
  />
}
