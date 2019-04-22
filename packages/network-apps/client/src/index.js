if ( !window._babelPolyfill ) require( '@babel/polyfill' );

import _ from 'lodash';

import React from 'react';
import ReactDOM from 'react-dom';

import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { Router } from "react-router-dom";
import { renderRoutes } from 'react-router-config';

if ( module.hot ) module.hot.accept();

import getRoutes from './getRoutes';
import reducers from './reducers';

const init = JSON.parse(
  document.getElementById( 'init' ).innerHTML,
  ( k, v ) => _.isString( v ) ? v.replace( '<CLOSINGSCRIPTTAG>', '</script>' ) : v
);

const loggerMiddleware = createLogger();

const initState = _.get( init, 'state' );

const config = _.get( init, 'config' );

const history = createBrowserHistory();

const store = createStore( combineReducers( {
  ...reducers,
  config: () => config,
} ), initState, applyMiddleware(
  thunkMiddleware.withExtraArgument( history ),
  loggerMiddleware
) );

const routes = getRoutes( config.base || '' );

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Router history={history}>
        {renderRoutes( routes )}
      </Router>
    </div>
  </Provider>,
  document.getElementById( 'app' )
);

if ( module.hot ) {

  module.hot.accept( './reducers', () => {

    const nextRootReducer = require( './reducers' );

    store.replaceReducer( nextRootReducer );

  } );

}
