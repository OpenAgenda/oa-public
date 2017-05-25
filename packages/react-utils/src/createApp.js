import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { Provider } from 'react-redux';
import { syncHistoryWithStore, replace } from 'react-router-redux';
import { Router, useRouterHistory, applyRouterMiddleware, match as _match } from 'react-router';
import { useScroll } from 'react-router-scroll';
import createHistory from 'history/lib/createBrowserHistory';
import { ReduxAsyncConnect } from 'redux-connect';
import deepExtend from 'deep-extend';

export default function ( defaultState, createStore, getRoutes, ApiClient, fn ) {

  const state = deepExtend( {
    settings: {
      lang: 'fr',
      prefix: '',
      apiRoot: ''
    },
    res: {}
  }, defaultState );

  const client = new ApiClient( state.settings.apiRoot );
  const browserHistory = useRouterHistory( createHistory )( /*{ basename: state.settings.prefix }*/ );
  const store = createStore( browserHistory, client, state );
  const history = syncHistoryWithStore( browserHistory, store );

  const { replace: redirect } = bindActionCreators( { replace }, store.dispatch );

  const renderRouter = props => {
    return <ReduxAsyncConnect
      {...props}
      helpers={{ client, redirect }}
      filter={item => !item.deferred}
      history={history}
      render={applyRouterMiddleware( useScroll() )}
    />;
  }

  if ( typeof window !== 'undefined' ) {
    window.React = React;
  }

  if ( process.env.NODE_ENV == 'development' && !window.devToolsExtension ) {
    const devToolsDest = document.createElement( 'div' );
    window.document.body.insertBefore( devToolsDest, null );
    const DevTools = require( './ReduxDevTools' );
    ReactDOM.render(
      <Provider store={store} key="provider">
        <DevTools />
      </Provider>,
      devToolsDest
    );
  }

  if ( fn ) fn( { client, store, history } );

  const routes = getRoutes( store );

  const match = elem => {
    _match( { history, routes }, ( error, redirectLocation, renderProps ) => {
      ReactDOM.render(
        <Provider store={store} key="provider">
          <Router {...renderProps} history={history} render={renderRouter}>
            {routes}
          </Router>
        </Provider>,
        elem
      );
    } );
  }

  return Object.assign( {},
    <Provider store={store} key="provider">
      <Router history={history} render={renderRouter}>
        {routes}
      </Router>
    </Provider>,
    { match }
  );

};
