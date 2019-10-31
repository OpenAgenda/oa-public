import _ from 'lodash';
import React from 'react';
import createApp from '@openagenda/react-utils/dist/createApp';
import getRoutes from './createRoutes';

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/new'
    },
    res: {
      create: '/new',
      slugAvailable: '/agendas/slugs/available',
      onCreated: '/:slug/admin/settings/gettingStarted'
    }
  }
};

export default function ( options ) {
  const { initialState, layout, req } = _.merge( {}, defaults, options );

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
    module.hot.accept('./createRoutes', () => {
      const newApp = getApp();

      result.Content = newApp.Content;
      result.triggerHooks = newApp.triggerHooks;
    });
  }

  return result;
}
