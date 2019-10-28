import { createMemoryHistory } from 'history';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { storiesOf } from '@storybook/react';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import createApp from '../src/app';
import PageDecorator from './decorators/PageDecorator';

import '@openagenda/bs-templates/compiled/main.css';
import sourcesJson from './mocks/sources';
import agendasJson from './mocks/agendas';

const mock = new MockAdapter(axios);

const mockApi = () => {
  mock.onGet('/sources.json').reply(200, sourcesJson);
  mock.onGet('/agendas.json').reply(200, agendasJson);
  mock.onGet(/^\/([^/]+?)\/?$/).reply(200, { agenda: agendasJson.agendas[0] }); // /:slug
};

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const getDefaultState = ({ lang = 'fr', apiRoot } = {}) => ({
  settings: {
    lang,
    apiRoot,
    prefix: '',
    perPageLimit: 20
  },
  res: {
    list: '/sources.json',
    add: '/add',
    show: '#',
    remove: '/remove',
    search: '#',
    createAggregator: '#',
    agendaSearch: '/agendas.json',
    slugSearch: '/:slug'
  }
});

storiesOf('App', module)
  .addDecorator(PageDecorator)
  .add('all', () => {
    mockApi();

    return wrapApp(
      createApp({
        history: createMemoryHistory(),
        initialState: getDefaultState({
          apiRoot: `http://${getHostname()}:${process.env.STORYBOOK_PORT}`
        })
      }),
      {
        extraProps: {
          agenda: {
            uid: 48959239,
            slug: 'la-gargouille',
            title: 'La gargouille',
            credentials: {
              aggregator: true
            }
          }
        }
      }
    );
  });
