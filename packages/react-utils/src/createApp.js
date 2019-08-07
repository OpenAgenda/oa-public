import React from 'react';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import apiClient from './apiClient';
import createStore from './createStore';
import clientMiddleware from './clientMiddleware';
import makeTriggerHooks from './makeTriggerHooks';

function getDefaultHistory( req ) {
  return req
    ? createMemoryHistory( { initialEntries: [ req.originalUrl ] } )
    : createBrowserHistory();
}

export default function createApp( options ) {
  const {
    initialState,
    Header,
    req,
    apiRoot,
    prefix,
    getReducers,
    getRoutes,
    reduxMiddleware
  } = options;

  const client = apiClient( apiRoot, req );
  const history = options.history || getDefaultHistory( req );
  const store = createStore(
    getReducers,
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware( { client } ),
        // ... other middlewares ... (like redux-logger)
        ...reduxMiddleware
      ),
      __CLIENT__ && __DEVELOPMENT__ && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : v => v
    )
  );

  const routes = getRoutes( prefix );

  const helpers = {
    client,
    store,
    history,
    location: history.location
  };
  const triggerHooks = makeTriggerHooks( { routes, history, helpers, req } );

  const Content = () => (
    <Provider store={store}>
      {Header ? <Header history={history} /> : null}
      {renderRoutes( routes )}
    </Provider>
  );

  return {
    Content,
    client,
    store,
    history,
    routes,
    triggerHooks
  };
}
