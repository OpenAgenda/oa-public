import { createMemoryHistory } from 'history';
import axios from 'axios';

import MockAdapter from 'axios-mock-adapter';
import { storiesOf } from '@storybook/react';
import wrapApp from '@openagenda/react-utils/dist/wrapApp';
import createApp from '../src/app';
import PageDecorator from './decorators/PageDecorator';

import '@openagenda/bs-templates/compiled/main.css';
import sourcesJson from './mocks/sources.json';
import agendasJson from './mocks/agendas.json';

const mock = new MockAdapter(axios);

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
    update: '#',
    show: '#',
    remove: '/remove',
    search: '#',
    createAggregator: '#',
    agendaSearch: '/agendas.json',
    slugSearch: '/:slug',
    getAggregator: '/:slug/admin/aggregator',
    setAggregator: '/:slug/admin/aggregator'
  }
});

export default storiesOf('Main', module)
  .addDecorator(PageDecorator)
  .add('Presentation', () => wrapApp(
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
  ))
  .add('Empty list', () => {
    mock.onGet('/sources.json').reply(200, {
      sources: [],
      aggregator: {
        limit: 12
      }
    });
    mock
      .onGet(/^\/([^/]+?)\/?admin\/aggregator$/)
      .reply(200, { agenda: agendasJson.agendas[0] });
    mock
      .onGet(/^\/([^/]+?)\/?$/)
      .reply(200, { agenda: agendasJson.agendas[0] }); // /:slug

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
  })

  .add('List', () => {
    mock.onGet('/sources.json').reply(200, sourcesJson);
    mock.onGet('/agendas.json').reply(200, agendasJson);
    mock
      .onGet(/^\/([^/]+?)\/?admin\/aggregator$/)
      .reply(200, { agenda: agendasJson.agendas[0] });
    mock
      .onGet(/^\/([^/]+?)\/?$/)
      .reply(200, { agenda: agendasJson.agendas[0] }); // /:slug

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
