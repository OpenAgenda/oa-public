import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { Provider } from 'react-redux';
import { syncHistoryWithStore, replace } from 'react-router-redux';
import { Router, useRouterHistory, applyRouterMiddleware, match as _match } from 'react-router';
import { useScroll } from 'react-router-scroll';
import { ReduxAsyncConnect } from 'redux-connect';

export default function ( options ) {

  const {
    state,
    createStore,
    getRoutes,
    createHistory,
    routerScroll,
    ApiClient,
    beforeCreate
  } = _.merge( {
    routerScroll: true,
    state: {
      settings: {
        lang: 'fr',
        prefix: '',
        apiRoot: ''
      },
      res: {}
    },
  }, options );

  const client = new ApiClient( state.settings.apiRoot );
  const browserHistory = useRouterHistory( createHistory )();
  const store = createStore( browserHistory, client, state );
  const history = syncHistoryWithStore( browserHistory, store );

  const redirect = bindActionCreators( replace, store.dispatch );

  const renderRouterProps = routerScroll ? { render: applyRouterMiddleware( useScroll() ) } : {};
  const renderRouter = props => {
    return <ReduxAsyncConnect
      {...props}
      {...renderRouterProps}
      helpers={{ client, redirect }}
      filter={item => !item.deferred}
      history={history}
    />;
  }

  if ( typeof window !== 'undefined' ) {
    window.React = React;
  }

  if ( process.env.NODE_ENV === 'development' && !window.__REDUX_DEVTOOLS_EXTENSION__ ) {
    const devToolsDest = document.createElement( 'div' );
    window.document.body.insertBefore( devToolsDest, null );
    const DevTools = require( './ReduxDevTools' );
    ReactDOM.hydrate(
      <DevTools store={store} />,
      devToolsDest
    );
  }

  if ( beforeCreate ) {
    beforeCreate( { client, store, history } );
  }

  const routes = getRoutes( store );

  const match = elem => {
    _match( { history, routes, location: state.settings.prefix || '/' }, ( error, redirectLocation, renderProps ) => {
      ReactDOM.hydrate(
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
