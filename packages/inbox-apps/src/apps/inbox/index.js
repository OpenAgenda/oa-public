import _ from 'lodash';
import React from 'react';
import createApp from '@openagenda/react-utils/dist/createApp';
import getRoutes from '../../getRoutes.lazy';

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      prefix: '/inboxes/user',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    }
  }
};

export default function ( options ) {
  const { initialState, layout, req } = _.merge( {}, defaults, options );

  const { apiRoot, prefix } = initialState.settings;

  const getApp = () => createApp( {
    history: options.history,
    initialState,
    layout,
    req,
    apiRoot,
    prefix,
    getRoutes,
    legacyApiClient: true
  } );

  const result = getApp();

  if (module.hot) {
    module.hot.accept('../../getRoutes.lazy', () => {
      const newApp = getApp();

      result.Content = newApp.Content;
      result.triggerHooks = newApp.triggerHooks;
    });
  }

  return result;
}
