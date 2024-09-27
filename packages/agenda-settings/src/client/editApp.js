import _ from 'lodash';
import { createApp } from '@openagenda/react-shared';
import getRoutes from './editRoutes';

const defaults = {
  initialState: {
    settings: {
      prefix: '/agendaSettings/edit',
      apiRoot: '',
    },
    res: {
      get: '/agendas/:uid/admin/settings.json',
      slugAvailable: '/agendas/slugs/available',
      set: '/:slug/admin/settings/edit',
      remove: '/:slug/admin/settings/remove',
    },
  },
};

export default (options) => {
  const { initialState } = _.merge({}, defaults, options);

  const { apiRoot, prefix } = initialState.settings;

  const getApp = () =>
    createApp({
      name: 'agenda-settings/edit',
      ...options,
      initialState,
      apiRoot,
      prefix,
      getRoutes,
    });

  const result = getApp();

  // causes issues in an integrated environment
  /* if (import.meta.webpackHot) {
    import.meta.webpackHot.accept('./editRoutes', () => {
      const newApp = getApp();

      result.Content = newApp.Content;
      result.triggerHooks = newApp.triggerHooks;
    });
  } */

  return result;
};
