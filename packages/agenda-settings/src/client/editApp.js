import _ from 'lodash';
import React from 'react';
import createApp from '@openagenda/react-utils/dist/createApp';
import getRoutes from './editRoutes';

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/agendaSettings/edit',
      apiRoot: `localhost:${process.env.PORT || 3000}`
    },
    res: {
      get: '/agendas/:uid/admin/settings.json',
      slugAvailable: '/agendas/slugs/available',
      set: '/:slug/admin/settings/edit',
      uploadImage: '/:slug/admin/settings/setImage',
      clearImage: '/:slug/admin/settings/clearImage',
      remove: '/:slug/admin/settings/remove'
    }
  }
};

export default function (options) {
  const { initialState, layout, req } = _.merge({}, defaults, options);

  const { apiRoot, prefix } = initialState.settings;

  const getApp = () => createApp({
    history: options.history,
    initialState,
    layout,
    req,
    apiRoot,
    prefix,
    getRoutes
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
