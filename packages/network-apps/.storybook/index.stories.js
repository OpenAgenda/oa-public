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

export default { title: 'Network list' };

export const main = () => {
  mock.onGet('').reply(200, networks);
  mock.onGet(/^\/networks.+/).reply(200, []);

  return <App
    createHistory={createMemoryHistory}
    base=""
    lang="fr"
  />
}
