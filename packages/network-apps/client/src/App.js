import React, { Component } from 'react';
import { connect } from 'react-redux';

import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, ReactReduxContext } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { Router } from "react-router-dom";
import { renderRoutes } from 'react-router-config';

import reducers from './reducers';
import getRoutes from './getRoutes';

export default (props = {}) => {
  const {
    base,
    lang,
    createHistory
  } = {
    base: null,
    lang: 'fr',
    createHistory: createBrowserHistory,
    ...props
  };

  const initState = {};
  const config = {
    base,
    lang
  };

  const history = createHistory();
  const loggerMiddleware = createLogger();

  const store = createStore(combineReducers({
    ...reducers,
    config: () => config,
  }), initState, applyMiddleware(
    thunkMiddleware.withExtraArgument(history),
    loggerMiddleware
 ));

  const routes = getRoutes(config.base || '/');

  return <Provider store={store} context={ReactReduxContext}>
    <div>
      <Router history={history}>
        {renderRoutes(routes)}
      </Router>
    </div>
  </Provider>

}
