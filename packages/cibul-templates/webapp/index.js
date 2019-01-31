import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { trigger } from 'redial';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router';
import { renderRoutes } from 'react-router-config';
import { ConnectedRouter } from 'connected-react-router';
import du from '@openagenda/dom-utils';
import asyncMatchRoutes from '@openagenda/react-utils/dist/asyncMatchRoutes';
import apiClient from '@openagenda/react-utils/dist/apiClient';
import ScrollToTop from '@openagenda/react-utils/dist/ScrollToTop';
import RouterRedialTrigger from '@openagenda/react-utils/dist/RouterRedialTrigger';
import createAppHome from '@openagenda/home/dist/client/app';

const history = createBrowserHistory();

const { initialState, appName } = JSON.parse( document.querySelector( 'body' ).getAttribute( 'data-options' ) );

// create apps with the good initialState
const apps = {
  home: createAppHome( {
    history,
    initialState: appName === 'home' ? initialState : { settings: { prefix: '/home' } }
  } )
};

const CaptureRouteNotFound = withRouter( ( { children, location } ) => {
  return location && location.state && location.state.notFoundError ? null : children;
} );

(async () => {
  let key, components, match, params;

  for ( key in apps ) {
    ({ components, match, params } = await asyncMatchRoutes(
      apps[ key ].routes,
      history.location.pathname
    ));

    const lastMatch = match[ match.length - 1 ];

    // Break loop on the first match
    if ( lastMatch && lastMatch.route.path ) {
      break;
    }
  }

  const client = apiClient();
  const triggerLocals = {
    store: apps[ appName ].store,
    client,
    match,
    params,
    history,
    location: history.location
  };

  // Don't fetch data for initial route, server has already done the work:
  if ( typeof window !== 'undefined' && window.__PRELOADED__ ) {
    // Delete initial data so that subsequent data fetches can occur:
    delete window.__PRELOADED__;
  } else {
    // Fetch mandatory data dependencies for 2nd route change onwards:
    await trigger( 'fetch', components, triggerLocals );
  }

  await trigger( 'defer', components, triggerLocals );

  ReactDOM.render(
    <>
      {Object.keys( apps )
        .map( appKey => (
          <Provider key={appKey} store={apps[ appKey ].store} context={apps[ appKey ].ReactReduxContext}>
            <ConnectedRouter history={history} context={apps[ appKey ].ReactReduxContext}>
              <CaptureRouteNotFound>
                <ScrollToTop>
                  <RouterRedialTrigger routes={apps[ appKey ].routes} helpers={{ store: apps[ appKey ].store, client }}>
                    {renderRoutes( apps[ appKey ].routes )}
                  </RouterRedialTrigger>
                </ScrollToTop>
              </CaptureRouteNotFound>
            </ConnectedRouter>
          </Provider>
        ) )}

      {Object.values( apps )
        .filter( app => app.history )
        .map( app => app.history.location.state )
        .every( state => state && state.notFoundError )
        ? (
          <div>Not Found !</div>
        ) : null}
    </>,
    du.el( '.js_canvas' )
  );
})();
