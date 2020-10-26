import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider, ReactReduxContext } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { Router, StaticRouter } from 'react-router-dom';
import apiClient from '@openagenda/react-shared/lib/utils/lib/apiClient';
import createStore from '@openagenda/react-shared/lib/utils/lib/createStore';
import clientMiddleware from '@openagenda/react-shared/lib/utils/lib/clientMiddleware';
import makeTriggerHooks from '@openagenda/react-shared/lib/utils/lib/makeTriggerHooks';
import RouterTrigger from '@openagenda/react-shared/lib/utils/lib/RouterTrigger';
import { NotFound } from '@openagenda/react-shared';
import getRoutes from '../../getRoutes';
import inboxReducer from '../../reducers/inbox';
import conversationReducer from '../../reducers/conversation';
import conversationFormReducer from '../../reducers/conversationForm';
import modalsReducer from '../../reducers/modals';

const defaults = {
  selector: '.js_inbox_event',
  initialState: {
    settings: {
      prefix: '/',
      lang: 'fr',
      perPageLimit: 20
    },
    res: {
      conversations: {
        list: '/agendas/:agendaUid/events/:eventUid/conversations'
      },
      messages: {
        list: '/agendas/:agendaUid/events/:eventUid/conversations/:conversationId/messages',
        create: '/agendas/:agendaUid/events/:eventUid/conversations/:conversationId/messages'
      }
    },
    agenda: {
      //
    },
    event: {
      //
    }
  },
  extraProps: null
};

export default function app(options = {}) {
  const {
    initialState,
    req,
    notFoundKey = _.uniqueId('lazyInbox'),
    extraProps
  } = _.merge({}, defaults, options);
  const { apiRoot, prefix } = initialState.settings;

  const client = apiClient(apiRoot, req, { legacy: true });
  const history = options.history || createMemoryHistory();
  const helpers = {};
  const store = createStore(
    null,
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware(helpers)
        // ... other middlewares ... (like redux-logger)
      ),
      __CLIENT__ && __DEVELOPMENT__ && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : v => v
    )
  );

  store.inject({
    inbox: inboxReducer,
    conversation: conversationReducer,
    conversationForm: conversationFormReducer,
    modals: modalsReducer
  });

  Object.assign(helpers, {
    client,
    store,
    history,
    location: history.location
  });
  const staticContext = {};

  const routes = getRoutes(prefix, notFoundKey);
  const triggerHooks = makeTriggerHooks({ routes, history, helpers, req });
  const content = (
    <NotFound.Capture notFoundKey={notFoundKey}>
      <RouterTrigger trigger={triggerHooks}>
        <Provider store={store} context={ReactReduxContext}>
          {renderRoutes(routes, extraProps)}
        </Provider>
      </RouterTrigger>
    </NotFound.Capture>
  );

  const element = (
    <Router history={history}>
      {req
        ? <StaticRouter location={req.originalUrl} context={staticContext}>{content}</StaticRouter>
        : content}
    </Router>
  );

  return {
    store,
    history,
    routes,
    element,
    notFoundKey,
    staticContext,
    triggerHooks
  };
};

export function expose(name) {

  window.ReactDOM = ReactDOM;
  window[name] = app;

}
