import _ from 'lodash';
import React from 'react';
import { createApp } from '@openagenda/react-shared';
import getRoutes from './createRoutes';

const defaults = {
  initialState: {
    settings: {
      prefix: '/agendas/new'
    },
    res: {
      create: '/agendas/new',
      slugAvailable: '/agendas/slugs/available',
      onCreated: '/:slug/admin/settings/gettingStarted'
    },
    agenda: {}
  }
};

export default function (options) {
  const { initialState } = _.merge({}, defaults, options);

  const { apiRoot, prefix } = initialState.settings;

  const getApp = () => createApp({
    name: 'agenda-settings/create',
    ...options,
    initialState,
    apiRoot,
    prefix,
    getRoutes
  });

  const result = getApp();

  if (module.hot) {
    module.hot.accept('./createRoutes', () => {
      const newApp = getApp();

      result.Content = newApp.Content;
      result.triggerHooks = newApp.triggerHooks;
    });
  }

  return result;
}
