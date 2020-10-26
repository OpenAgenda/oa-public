import _ from 'lodash';
import React from 'react';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider, ReactReduxContext } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { Router, StaticRouter } from 'react-router-dom';
import apiClient from '@openagenda/react-shared/lib/utils/lib/apiClient';
import createStore from '@openagenda/react-shared/lib/utils/lib/createStore';
import clientMiddleware from '@openagenda/react-shared/lib/utils/lib/clientMiddleware';
import makeTriggerHooks from '@openagenda/react-shared/lib/utils/lib/makeTriggerHooks';
import RouterTrigger from '@openagenda/react-shared/lib/utils/lib/RouterTrigger';
import ScrollToTop from '@openagenda/react-shared/lib/utils/lib/ScrollToTop';
import { NotFound } from '@openagenda/react-shared';
import getReducers from '../../redux/reducer';
import getRoutes from './getRoutes';

const defaults = {
  state: {
    settings: {
      lang: 'fr',
      prefix: '/admin/activities',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20
    },
    res: {
      list: '/list'
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
    layout,
    req,
    notFoundKey = _.uniqueId( 'activityAppsAdmin' )
  } = _.merge( {}, defaults, options );
  const { apiRoot, prefix } = initialState.settings;

  const client = apiClient( apiRoot, req, { legacy: true } );
  const history = options.history || getDefaultHistory( req );
  const helpers = {};
  const store = createStore(
    getReducers,
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware( helpers )
        // ... other middlewares ... (like redux-logger)
      ),
      __CLIENT__ && __DEVELOPMENT__ && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : v => v
    )
  );
  Object.assign( helpers, {
    client,
    store,
    history,
    location: history.location
  } );
  const staticContext = {};

  const routes = getRoutes( prefix, notFoundKey );
  const triggerHooks = makeTriggerHooks( { routes, history, helpers, req } );
  const content = (
    <NotFound.Capture notFoundKey={notFoundKey}>
      <RouterTrigger trigger={triggerHooks}>
        <Provider store={store} context={ReactReduxContext}>
          {renderRoutes( routes )}
        </Provider>
      </RouterTrigger>
    </NotFound.Capture>
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
    triggerHooks,
    layout
  };
};
