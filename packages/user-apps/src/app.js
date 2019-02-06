import _ from 'lodash';
import React from 'react';
import { trigger } from 'redial';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider, ReactReduxContext } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { Router, StaticRouter } from 'react-router-dom';
import apiClient from '@openagenda/react-utils/dist/apiClient';
import createStore from '@openagenda/react-utils/dist/createStore';
import clientMiddleware from '@openagenda/react-utils/dist/clientMiddleware';
import asyncMatchRoutes from '@openagenda/react-utils/dist/asyncMatchRoutes';
import RouterRedialTrigger from '@openagenda/react-utils/dist/RouterRedialTrigger';
import ScrollToTop from '@openagenda/react-utils/dist/ScrollToTop';
import NotFound from '@openagenda/react-utils/dist/NotFound';
import getReducers from './redux/reducer';
import getRoutes from './getRoutes';

const defaults = {
  initialState: {
    settings: {
      prefix: '',
      lang: 'fr',
      apiRoot: 'http://localhost:3000'
    }
  }
};

function getDefaultHistory( req ) {
  return req
    ? createMemoryHistory( { initialEntries: [ req.originalUrl ] } )
    : createBrowserHistory();
}

export default function ( options ) {
  const {
    initialState,
    req,
    notFoundKey = _.uniqueId( 'userSettings' )
  } = _.merge( {}, defaults, options );
  const { apiRoot, prefix } = initialState.settings;

  const client = apiClient( apiRoot, req );
  const history = options.history || getDefaultHistory( req );
  const store = createStore(
    getReducers,
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware( { client } )
        // ... other middlewares ... (like redux-logger)
      ),
      __CLIENT__ && __DEVELOPMENT__ && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : v => v
    )
  );
  const helpers = {
    client,
    store,
    history,
    location: history.location
  };
  const staticContext = {};

  const routes = getRoutes( prefix, notFoundKey );
  const triggerHooks = makeTriggerHooks( { routes, history, helpers, req } );
  const content = (
    <RouterRedialTrigger trigger={triggerHooks}>
      <NotFound.Capture notFoundkey={notFoundKey}>
          <Provider store={store} context={ReactReduxContext}>
            {renderRoutes( routes )}
          </Provider>
      </NotFound.Capture>
    </RouterRedialTrigger>
  );

  const element = (
    <Router history={history}>
      <ScrollToTop>
        {req
          ? <StaticRouter location={req.originalUrl} context={staticContext}>{content}</StaticRouter>
          : content}
      </ScrollToTop>
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
}

function makeTriggerHooks( { routes, history, helpers, req } ) {
  return async () => {
    const { components, match, params } = await asyncMatchRoutes(
      routes,
      req ? req.originalUrl : history.location.pathname
    );
    const triggerLocals = {
      ...helpers,
      match,
      params
    };

    // Don't fetch data for initial route, server has already done the work:
    if ( typeof window !== 'undefined' && window.__PRELOADED__ ) {
      // Delete initial data so that subsequent data fetches can occur:
      delete window.__PRELOADED__;
    } else {
      // Fetch mandatory data dependencies for 2nd route change onwards:
      await trigger( 'fetch', components, triggerLocals );
    }

    if ( typeof window !== 'undefined' ) {
      await trigger( 'defer', components, triggerLocals );
    }
  };
}
