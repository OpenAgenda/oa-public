import React from 'react';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import apiClient from './apiClient';
import createStore from './createStore';
import clientMiddleware from './clientMiddleware';
import makeTriggerHooks from './makeTriggerHooks';
import ApiClientContext from './ApiClientContext';

function getDefaultHistory( req ) {
  return req
    ? createMemoryHistory( { initialEntries: [ req.originalUrl ] } )
    : createBrowserHistory();
}

export default function createApp( options ) {
  const {
    initialState,
    layout,
    req,
    apiRoot,
    prefix,
    getReducers,
    getRoutes,
    reduxMiddleware = []
  } = options;

  const client = apiClient( apiRoot, req );
  const history = options.history || getDefaultHistory( req );
  const helpers = {};
  const store = createStore(
    getReducers,
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware( helpers ),
        // ... other middlewares ... (like redux-logger)
        ...reduxMiddleware
      ),
      __CLIENT__ && __DEVELOPMENT__ && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : v => v
    )
  );

  const routes = getRoutes( prefix );

  Object.assign(helpers, {
    client,
    store,
    history,
    location: history.location
  });

  const triggerHooks = makeTriggerHooks( { routes, history, helpers, req } );

  const Content = React.memo(({ extraProps, switchProps }) => (
    <Provider store={store}>
      <ApiClientContext.Provider value={client}>
        {renderRoutes( routes, extraProps, switchProps )}
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
    layout
  };
}
