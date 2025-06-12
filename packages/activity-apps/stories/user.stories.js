import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/client/apps/user/index.js';
import PageDecorator from './decorators/PageDecorator.js';

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = ({ apiRoot } = {}) => ({
  settings: {
    apiRoot,
    prefix: '',
    perPageLimit: 20,
  },
  res: {
    list: '/user/list',
  },
});

export default {
  title: 'User',
  decorators: [PageDecorator],
};

export function App() {
  return wrapApp(
    createApp({
      history: createMemoryHistory(),
      initialState: getDefaultState({
        apiRoot: '/',
      }),
    }),
    {
      extraProps: {
        lang: 'fr',
      },
    },
  );
}
