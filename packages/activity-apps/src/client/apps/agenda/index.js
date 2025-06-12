import merge from 'lodash/merge.js';
import { createApp } from '@openagenda/react-shared';
import getRoutes from './getRoutes.js';

const defaults = {
  initialState: {
    settings: {
      prefix: '/activities',
      apiRoot: 'localhost:3000',
      perPageLimit: 20,
    },
    res: {
      list: '/:uid/list',
    },
    activities: {},
  },
};

export default (options) => {
  const { initialState } = merge({}, defaults, options);

  const { apiRoot, prefix } = initialState.settings;

  const getApp = () =>
    createApp({
      ...options,
      initialState,
      apiRoot,
      prefix,
      getRoutes,
    });

  const result = getApp();

  // if (import.meta.webpackHot) {
  //   import.meta.webpackHot.accept('./getRoutes', () => {
  //     const newApp = getApp();
  //
  //     result.Content = newApp.Content;
  //     result.triggerHooks = newApp.triggerHooks;
  //   });
  // }

  return result;
};
