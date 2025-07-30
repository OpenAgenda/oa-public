import React from 'react';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { UIKitProvider, createSystem, themeConfig } from '@openagenda/uikit';
import { ApiClientContext } from '../contexts/index.js';
import createApiClient from './apiClient.js';
import createStore from './createStore.js';
import clientMiddleware from './clientMiddleware.js';
import makeTriggerHooks from './makeTriggerHooks.js';

function getDefaultHistory(req) {
  return req
    ? createMemoryHistory({ initialEntries: [req.originalUrl] })
    : createBrowserHistory();
}

const system = createSystem(themeConfig, {
  disableLayers: true,
  preflight: false,
});

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
    apiRoot,
    req,
  });

  const triggerHooks = makeTriggerHooks({
    routes,
    history,
    helpers,
    req,
  });

  const Content = React.memo(({ extraProps, switchProps }) => (
    <UIKitProvider theme={system}>
      <Provider store={store}>
        <ApiClientContext.Provider value={client}>
          {renderRoutes(routes, extraProps, switchProps)}
        </ApiClientContext.Provider>
      </Provider>
    </UIKitProvider>
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
