import _ from 'lodash';
import React from 'react';
import { trigger } from 'redial';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider, ReactReduxContext } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { StaticRouter } from 'react-router-dom';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
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
    },
    res: {
      list: '/agendas',
      new: '/new',
      events: '/home/events',
      messages: '/home/messages',
      notifs: '/home/notifications',
      moderate: '/:slug/admin',
      show: '/:slug',
      showPrivate: '/:slug.prv',
      addEvent: '/:slug/addevent',
      search: '/agendas'
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
    notFoundKey = _.uniqueId( 'home' )
  } = _.merge( {}, defaults, options );
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
  const staticContext = {};

  const routes = getRoutes( prefix, notFoundKey );
  const content = (
    <RouterRedialTrigger routes={routes} helpers={helpers}>
      {renderRoutes( routes )}
    </RouterRedialTrigger>
  );
  const element = (
    <Provider store={store} context={ReactReduxContext}>
      <ConnectedRouter history={history} context={ReactReduxContext}>
        <NotFound.Capture notFoundkey={notFoundKey}>
          <ScrollToTop>
            {req
              ? <StaticRouter location={req.originalUrl} context={staticContext}>{content}</StaticRouter>
              : content}
          </ScrollToTop>
        </NotFound.Capture>
      </ConnectedRouter>
    </Provider>
  );

  return {
    store,
    history,
    routes,
    element,
    notFoundKey,
    staticContext,
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
