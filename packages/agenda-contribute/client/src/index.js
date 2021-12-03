import {
  createApp
} from '@openagenda/react-shared';
import { createLogger } from 'redux-logger';

import getRoutes from './getRoutes';

const loggerMiddleware = createLogger();

export default function contribute(options) {
  const { initialState } = options;

  const { APIRoot, prefix } = initialState;

  return createApp({
    name: 'agendaContribute',
    ...options,
    initialState,
    apiRoot: APIRoot,
    prefix,
    getRoutes,
    reduxMiddleware: [
      loggerMiddleware
    ]
  });
}
