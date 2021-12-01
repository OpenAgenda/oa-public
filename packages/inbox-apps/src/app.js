import _ from 'lodash';
import React from 'react';
import { createApp } from '@openagenda/react-shared';
import getRoutes from './getRoutes';
import inboxReducer from './reducers/inbox';
import conversationReducer from './reducers/conversation';
import conversationFormReducer from './reducers/conversationForm';
import modalsReducer from './reducers/modals';

const defaults = {
  initialState: {
    settings: {
      prefix: '/inboxes/user',
      perPageLimit: 20
    }
  }
};

function getReducers(injectedReducers) {
  return {
    inbox: inboxReducer,
    conversation: conversationReducer,
    conversationForm: conversationFormReducer,
    modals: modalsReducer,
    ...injectedReducers
  };
}

export default function createInboxApp(options) {
  const { initialState } = _.merge({}, defaults, options);

  const { apiRoot, prefix } = initialState.settings;

  const getApp = () => createApp({
    name: 'inbox',
    ...options,
    getReducers,
    initialState,
    apiRoot,
    prefix,
    getRoutes,
    legacyApiClient: true
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
