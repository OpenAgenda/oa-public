import React from 'react';
import ReactDOM from 'react-dom';

import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, ReactReduxContext } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { Router } from 'react-router';
import { renderRoutes } from 'react-router-config';

if (module.hot) module.hot.accept();

import getRoutes from './getRoutes';
import reducers from './reducers';
import scrollToTopMiddleware from './lib/scrollToTopMiddleware';
import URLDefaults from './lib/URLDefaults';

const init = JSON.parse(document.getElementById('init').innerHTML);

const loggerMiddleware = createLogger();
const initState = init?.state;
const config = init?.config;

const defaults = URLDefaults.get();

const history = createBrowserHistory();

const store = createStore(combineReducers({
  ...reducers,
  config: () => config,
  defaults: () => defaults,
}), initState, applyMiddleware(
  thunkMiddleware.withExtraArgument(history),
  loggerMiddleware,
  scrollToTopMiddleware({
    scrollableTypes: [
      reducers.event.actionTypes.UPDATE,
      reducers.event.actionTypes.CREATE,
      reducers.member.actionTypes.UPDATE
    ],
    scrollToAnchor: 'stepper'
  })
));

const routes = getRoutes(config.base || '');

ReactDOM.render(
  <Provider store={store} context={ReactReduxContext}>
    <div>
      <Router history={history}>
        {renderRoutes(routes)}
      </Router>
    </div>
  </Provider>,
  document.getElementById('app')
);

if (module.hot) {
  module.hot.accept('./reducers', () => {
    const nextRootReducer = require('./reducers');

    store.replaceReducer(nextRootReducer);
  });
}
