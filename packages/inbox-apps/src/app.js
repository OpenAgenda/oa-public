import merge from 'lodash/merge.js';
import { createApp } from '@openagenda/react-shared';
import getRoutes from './getRoutes.js';
import inboxReducer from './reducers/inbox.js';
import conversationReducer from './reducers/conversation.js';
import conversationFormReducer from './reducers/conversationForm.js';
import modalsReducer from './reducers/modals.js';

const defaults = {
  initialState: {
    settings: {
      prefix: '/inboxes/user',
      perPageLimit: 20,
    },
  },
};

function getReducers(injectedReducers) {
  return {
    inbox: inboxReducer,
    conversation: conversationReducer,
    conversationForm: conversationFormReducer,
    modals: modalsReducer,
    ...injectedReducers,
  };
}

export default function createInboxApp(options) {
  const { initialState } = merge({}, defaults, options);

  const { apiRoot, prefix } = initialState.settings;

  const getApp = () =>
    createApp({
      name: 'inbox',
      ...options,
      getReducers,
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
}
