import _ from 'lodash';
import React from 'react';
import { createApp } from '@openagenda/react-shared';
import getRoutes from './editRoutes';

const defaults = {
  initialState: {
    settings: {
      prefix: '/agendaSettings/edit',
      apiRoot: ''
    },
    res: {
      get: '/agendas/:uid/admin/settings.json',
      slugAvailable: '/agendas/slugs/available',
      set: '/:slug/admin/settings/edit',
      remove: '/:slug/admin/settings/remove'
    }
  }
};

export default function (options) {
  const { initialState } = _.merge({}, defaults, options);

  const { apiRoot, prefix } = initialState.settings;

  const getApp = () => createApp({
    name: 'agenda-settings/edit',
    ...options,
    initialState,
    apiRoot,
    prefix,
    getRoutes,
    legacyApiClient: true
  });

  const result = getApp();

  if (module.hot) {
    module.hot.accept('./editRoutes', () => {
      const newApp = getApp();

      result.Content = newApp.Content;
      result.triggerHooks = newApp.triggerHooks;
    });
  }

  return result;
}
