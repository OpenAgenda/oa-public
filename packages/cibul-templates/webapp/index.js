import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { trigger } from 'redial';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { ConnectedRouter } from 'connected-react-router';
import du from '@openagenda/dom-utils';
import asyncMatchRoutes from '@openagenda/react-utils/dist/asyncMatchRoutes';
import apiClient from '@openagenda/react-utils/dist/apiClient';
import ScrollToTop from '@openagenda/react-utils/dist/ScrollToTop';
import RouterRedialTrigger from '@openagenda/react-utils/dist/RouterRedialTrigger';
// import NotFound from '@openagenda/react-utils/dist/NotFound';
import createAppHome from '@openagenda/home/dist/client/app';
import getRoutesHome from '@openagenda/home/dist/client/getRoutes';

const history = createBrowserHistory();

const { initialState, appName } = JSON.parse( document.querySelector( 'body' ).getAttribute( 'data-options' ) );

const routes = {
  home: getRoutesHome( '/home' )
};

// create apps with the good initialState
const apps = {
  home: createAppHome( {
    history,
    initialState: appName === 'home' ? initialState : { settings: { prefix: '/home' } }
  } )
};

// All routes without each 404
// const allRoutes = Object.values( routes )
//   .map( v => ({
//     ...v[ 0 ],
//     routes: v[ 0 ].routes.slice( 0, -1 )
//   }) );

(async () => {
  let key, components, match, params;

  for ( key in routes ) {
    ({ components, match, params } = await asyncMatchRoutes(
      routes[ key ],
      history.location.pathname
    ));

    // Break loop on the first match
    if ( match.length ) {
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

  // TODO without 404
  // TODO avoid layout repetitions
  ReactDOM.render(
    <>
      {Object.keys( apps )
        .map( appKey => (
          <Provider key={appKey} store={apps[ appKey ].store} context={apps[ appKey ].ReactReduxContext}>
            <ConnectedRouter history={history} context={apps[ appKey ].ReactReduxContext}>
              <ScrollToTop>
                <RouterRedialTrigger
                  routes={routes[ appKey ]}
                  helpers={{ store: apps[ appName ].store, client }}
                >
                    {renderRoutes( routes[ appKey ] )}
                </RouterRedialTrigger>
              </ScrollToTop>
            </ConnectedRouter>
          </Provider>
        ) )}
    </>,
    du.el( '.js_canvas' )
  );
})();
