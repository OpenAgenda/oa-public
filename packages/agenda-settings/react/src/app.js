import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom/server';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { Router, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import { ReduxAsyncConnect } from 'redux-connect';
import createStore from './redux/create';
import ApiClient from '../../helpers/ApiClient';
import deepExtend from 'deep-extend';

require( 'dom-utils/ie8' );
require( 'dom-utils/ie9' );

export default function ( options, routes, fn ) {

  const params = deepExtend( {
    state: {
      settings: {
        lang: 'fr',
        prefix: ''
      },
      res: {}
    }
  }, options );

  const client = new ApiClient( params.state.settings.apiRoot );
  const browserHistory = useRouterHistory( createHistory )();
  const store = createStore( browserHistory, client, params.state );
  const history = syncHistoryWithStore( browserHistory, store );

  const renderRouter = props => {
    return <ReduxAsyncConnect {...props} helpers={{ client }} filter={item => !item.deferred} />;
  }

  if ( process.env.NODE_ENV == 'development' && !window.devToolsExtension ) {
    const devToolsDest = document.createElement( 'div' );
    window.document.body.insertBefore( devToolsDest, null );
    const DevTools = require( './containers/DevTools/DevTools' );
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
      <Router history={history} render={renderRouter}>
        {routes( store )}
      </Router>
    </Provider>
  );

};
