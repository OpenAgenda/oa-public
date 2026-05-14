import { http, HttpResponse } from 'msw';
import { createMemoryHistory } from 'history';
import createApp from '../src/client/apps/agenda/index.js';
import PageDecorator from './decorators/PageDecorator.js';

import '@openagenda/bs-templates/compiled/main.css';
import agenda from './fixtures/agenda.json' with { type: 'json' };

const getDefaultState = ({ apiRoot } = {}) => ({
  settings: {
    apiRoot,
    prefix: '',
    perPageLimit: 20,
  },
  res: {
    list: '/agenda/list',
  },
  agenda: {
    uid: 48959239,
    slug: 'la-gargouille',
    title: 'La gargouille',
    isAggregator: true,
  },
});

export default {
  title: 'Agenda',
  decorators: [PageDecorator],
  parameters: {
    msw: {
      handlers: [
        http.get('/agenda/list', () => {
          console.log('GET /agenda/list', JSON.parse(agenda));
          return HttpResponse.json(agenda);
        }),
      ],
    },
  },
};

export function App() {
  const { element } = createApp({
    history: createMemoryHistory(),
    initialState: getDefaultState({
      apiRoot: '/',
    }),
  });

  return element;
}
