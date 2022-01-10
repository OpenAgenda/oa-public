import React from 'react';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/client/createApp';

import '@openagenda/bs-templates/compiled/main.css';

const getDefaultState = () => ({
  settings: {
    prefix: ''
  },
  res: {
    create: '',
    slugAvailable: '/slugs/available',
    onCreated: ''
  }
});

export default {
  title: 'Create'
};

export const App = () => wrapApp(createApp({
  history: createMemoryHistory(),
  initialState: getDefaultState()
}));
