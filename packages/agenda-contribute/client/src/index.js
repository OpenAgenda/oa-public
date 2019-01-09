if ( !window._babelPolyfill ) require( '@babel/polyfill' );

import _ from 'lodash';

import React, { Component } from 'react';
import { render } from 'react-dom';

import createHistory from 'history/createBrowserHistory';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import {
  syncHistoryWithStore,
  routerMiddleware,
  routerReducer
} from 'react-router-redux';

import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Confirmation from './containers/Confirmation';
import EventNew from './containers/EventNew';
import EventEdit from './containers/EventEdit';
import Landing from './containers/Landing';
import Member from './containers/Member';

if ( module.hot ) module.hot.accept();

import { combineReducers } from 'redux';
import reducers from './reducers';

reducers.router = routerReducer;

const init = JSON.parse(
  document.getElementById( 'init' ).innerHTML,
  ( k, v ) => _.isString( v ) ? v.replace( '<CLOSINGSCRIPTTAG>', '</script>' ) : v
);

const loggerMiddleware = createLogger();

const initState = _.get( init, 'state' );

const config = _.get( init, 'config' );

const store = createStore( combineReducers( {
  ...reducers,
  routing: routerReducer,
  config: () => config,
} ), initState, applyMiddleware(
  thunkMiddleware,
  loggerMiddleware,
  routerMiddleware( browserHistory )
) );

if ( module.hot ) {

  module.hot.accept( './reducers', () => {

    const nextRootReducer = require( './reducers' );

    store.replaceReducer( nextRootReducer );

  } );

}

const history = syncHistoryWithStore( browserHistory, store );

console.log( '***** CHANGE ******' );

render( <Provider store={store}>
  <div>
    <Router history={history}>
      <div>
        <Route path={config.base} component={Landing} />
        <Route path={config.base + '/member'} component={Member} />
        <Route path={config.base + '/event'}>
          <IndexRoute component={EventNew}/>
          <Route path={':eventUid/draft'} component={EventNew} />
          <Route path={':eventUid'} component={EventEdit} />
        </Route>
        <Route path={config.base + '/confirmation'} component={Confirmation} />
      </div>
    </Router>
  </div>
</Provider>, document.getElementById( 'app' ) );
