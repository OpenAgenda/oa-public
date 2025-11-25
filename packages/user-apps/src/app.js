import _ from 'lodash';
import { createApp } from '@openagenda/react-shared';
import getRoutes from './getRoutes.js';

const defaults = {
  initialState: {
    settings: {
      prefix: '',
    },
    userSettings: {
      loading: true,
      modal: {},
      successMessagesDisplayed: {},
    },
  },
};

export default (options) => {
  const { initialState } = _.merge({}, defaults, options);
  const { prefix } = initialState.settings;

  const getApp = () =>
    createApp({
      ...options,
      initialState,
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
