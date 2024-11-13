import { createApp } from '@openagenda/react-shared';
import reduxLogger from 'redux-logger';

import getRoutes from './getRoutes.js';

const loggerMiddleware = reduxLogger.createLogger();

export default function contribute(options) {
  const { initialState } = options;

  const { apiRoot, prefix } = initialState.settings;

  initialState.contribute = initialState.contribute ?? {};

  return createApp({
    name: 'agendaContribute',
    ...options,
    initialState,
    apiRoot,
    prefix,
    getRoutes,
    reduxMiddleware: [loggerMiddleware],
  });
}
