import React from 'react';
import { trigger } from 'redial';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { StaticRouter, Route } from 'react-router-dom';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import apiClient from '@openagenda/react-utils/dist/apiClient';
import createStore from '@openagenda/react-utils/dist/createStore';
import clientMiddleware from '@openagenda/react-utils/dist/clientMiddleware';
import RouterRedialTrigger from '@openagenda/react-utils/dist/RouterRedialTrigger';
import asyncMatchRoutes from '@openagenda/react-utils/dist/asyncMatchRoutes';
import ScrollToTop from '@openagenda/react-utils/dist/ScrollToTop';
import getReducers from './redux/reducer';
import getRoutes from './getRoutes';

function getDefaultHistory( req ) {
  return req
    ? createMemoryHistory( { initialEntries: [ req.originalUrl ] } )
    : createBrowserHistory();
}

export default function ( options ) {

  const { initialState, req } = options;
  const { apiRoot, prefix } = initialState.settings;

  const client = apiClient( apiRoot, req );
  const history = options.history || getDefaultHistory( req );
  const store = createStore(
    getReducers.bind( null, history ),
    initialState,
    compose(
      applyMiddleware(
        routerMiddleware( history ),
        clientMiddleware( { client } )
        // ... other middlewares ... (like redux-logger)
      ),
      __CLIENT__ && __DEVELOPMENT__ && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : v => v
    )
  );
  const helpers = { client, store };
  const context = {};

  const routes = getRoutes( prefix );
  const content = (
    <RouterRedialTrigger routes={routes} helpers={helpers}>
      {renderRoutes( routes )}
    </RouterRedialTrigger>
  );
  const element = (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <ScrollToTop>
          {req
            ? (
              <Route
                path={prefix}
                component={() =>
                  <StaticRouter location={req.originalUrl} context={context}>{content}</StaticRouter>
                }
              />
            ) : content}
        </ScrollToTop>
      </ConnectedRouter>
    </Provider>
  );

  return {
    store,
    history,
    routes,
    context,
    element,
    triggerHooks: async () => {
      const { components, match, params } = await asyncMatchRoutes(
        routes,
        req ? req.originalUrl : history.location.pathname
      );
      const triggerLocals = {
        ...helpers,
        match,
        params,
        history,
        location: history.location
      };

      // Don't fetch data for initial route, server has already done the work:
      if ( !req && typeof window !== 'undefined' && window.__PRELOADED__ ) {
        // Delete initial data so that subsequent data fetches can occur:
        delete window.__PRELOADED__;
      } else {
        // Fetch mandatory data dependencies for 2nd route change onwards:
        await trigger( 'fetch', components, triggerLocals );
      }

      if ( !req ) {
        await trigger( 'defer', components, triggerLocals );
      }
    }
  };
}
