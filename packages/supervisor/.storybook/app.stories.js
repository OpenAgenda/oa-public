import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/app';

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = () => ({
  settings: {
    prefix: '/',
  },
});

export default { title: 'App' };

export const announcement = () => wrapApp(
  createApp({
    history: createMemoryHistory({ initialEntries: ['/announcement'] }),
    initialState: getDefaultState(),
  }),
  {
    extraProps: {
      user: {},
    },
  }
);
