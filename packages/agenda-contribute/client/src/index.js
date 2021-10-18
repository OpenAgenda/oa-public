import {
  createApp
} from '@openagenda/react-shared';
import { createLogger } from 'redux-logger';

import getRoutes from './getRoutes';
import scrollToTopMiddleware from './lib/scrollToTopMiddleware';
import reducers from './reducers';

const loggerMiddleware = createLogger();

export default function contribute(options) {
  const { initialState } = options;

  const { apiRoot, prefix } = initialState;

  return createApp({
    ...options,
    name: 'contribute',
    initialState,
    apiRoot,
    prefix,
    getRoutes,
    reduxMiddleware: [
      loggerMiddleware,
      scrollToTopMiddleware({
        scrollableTypes: [
          reducers.event.actionTypes.UPDATE,
          reducers.event.actionTypes.CREATE,
          reducers.member.actionTypes.ADD
        ],
        scrollToAnchor: 'stepper'
      })
    ]
  });
}
