import _ from 'lodash';
import React from 'react';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider, ReactReduxContext } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { Router, StaticRouter } from 'react-router-dom';
import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as LoadableSecret } from '@loadable/component';
import apiClient from '@openagenda/react-utils/dist/apiClient';
import createStore from '@openagenda/react-utils/dist/createStore';
import clientMiddleware from '@openagenda/react-utils/dist/clientMiddleware';
import makeTriggerHooks from '@openagenda/react-utils/dist/makeTriggerHooks';
import RouterTrigger from '@openagenda/react-utils/dist/RouterTrigger';
import ScrollToTop from '@openagenda/react-utils/dist/ScrollToTop';
import NotFound from '@openagenda/react-utils/dist/NotFound';
import getReducers from './redux/reducer';
import getRoutes from './getRoutes';

const { Context: LoadableContext } = LoadableSecret;

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
    Header,
    req,
    extractor,
    notFoundKey = _.uniqueId( 'home' ),
    onLocationChangeStart,
    onLocationChangeFinish
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
    <NotFound.Capture notFoundKey={notFoundKey}>
      <RouterTrigger
        trigger={() => triggerHooks( {
          onStart: onLocationChangeStart,
          onFinish: onLocationChangeFinish
        } )}
      >
        <Provider store={store} context={ReactReduxContext}>
          {Header ? <Header history={history} /> : null}
          {renderRoutes( routes )}
        </Provider>
      </RouterTrigger>
    </NotFound.Capture>
  );

  const element = (
    <LoadableContext.Provider value={extractor} key={notFoundKey}>
      <Router history={history}>
        <ScrollToTop>
          {req
            ? <StaticRouter location={req.originalUrl} context={staticContext}>{content}</StaticRouter>
            : content}
        </ScrollToTop>
      </Router>
    </LoadableContext.Provider>
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
