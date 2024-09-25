import React from 'react';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { ApiClientContext } from '../contexts';
import createApiClient from './apiClient';
import createStore from './createStore';
import clientMiddleware from './clientMiddleware';
import makeTriggerHooks from './makeTriggerHooks';

function getDefaultHistory(req) {
  return req
    ? createMemoryHistory({ initialEntries: [req.originalUrl] })
    : createBrowserHistory();
}

export default function createApp(options) {
  const {
    name,
    initialState,
    layout,
    req,
    apiClient,
    apiRoot,
    legacyApiClient,
    prefix,
    getReducers,
    getRoutes,
    reduxMiddleware = [],
  } = options;

  const client = apiClient || createApiClient(apiRoot, req, { legacy: legacyApiClient });
  const history = options.history || getDefaultHistory(req);
  const helpers = {};
  const store = createStore(
    getReducers,
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware(helpers),
        // ... other middlewares ... (like redux-logger)
        ...Array.isArray(reduxMiddleware)
          ? reduxMiddleware
          : [reduxMiddleware],
      ),
      typeof window !== 'undefined'
        && process.env.NODE_ENV === 'development'
        && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__({
          name: name ? `${name} — ${document.title}` : document.title,
        })
        : (v) => v,
    ),
  );

  const routes = getRoutes(prefix);

  Object.assign(helpers, {
    client,
    store,
    history,
    location: history.location,
  });

  const triggerHooks = makeTriggerHooks({
    routes,
    history,
    helpers,
    req,
  });

  const Content = React.memo(({ extraProps, switchProps }) => (
    <Provider store={store}>
      <ApiClientContext.Provider value={client}>
        {renderRoutes(routes, extraProps, switchProps)}
      </ApiClientContext.Provider>
    </Provider>
  ));

  return {
    Content,
    client,
    store,
    history,
    routes,
    triggerHooks,
    layout,
  };
}
