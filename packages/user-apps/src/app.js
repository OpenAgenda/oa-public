import _ from 'lodash';
import React from 'react';
import createApp from '@openagenda/react-utils/dist/createApp';
import getRoutes from './getRoutes';

const defaults = {
  initialState: {
    settings: {
      prefix: '',
      lang: 'fr',
      apiRoot: 'http://localhost:3000'
    },
    userSettings: {
      user: {},
      modal: {},
      successMessagesDisplayed: {}
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
    module.hot.accept('./getRoutes', () => {
      const newApp = getApp();

      result.Content = newApp.Content;
      result.triggerHooks = newApp.triggerHooks;
    });
  }

  return result;
}
