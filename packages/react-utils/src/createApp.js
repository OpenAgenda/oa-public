import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom/server';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { Router, useRouterHistory } from 'react-router';
import createHistory from 'history/createBrowserHistory';
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

  const renderRouter = props => {
    return <ReduxAsyncConnect {...props} helpers={{ client }} filter={item => !item.deferred} />;
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

  return (
    <Provider store={store} key="provider">
      <Router history={history}>
        {getRoutes( store )}
      </Router>
    </Provider>
  );

};
