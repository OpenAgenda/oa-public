import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app.js';
import PageDecorator from './decorators/PageDecorator.js';

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = () => ({
  settings: {
    prefix: '',
  },
  res: {
    jsonExport: '/events',
    search: '/api/agendas/:uid/events/search',
  },
  stats: {},
});

export default {
  title: 'App',
  decorators: [PageDecorator],
};

export function All() {
  return wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState(),
    }),
    {
      extraProps: {
        lang: 'fr',
        agenda: {
          uid: 48959239,
          slug: 'la-gargouille',
          title: 'La gargouille',
        },
        agendaSchema: {
          fields: [],
        },
      },
    },
  );
}
