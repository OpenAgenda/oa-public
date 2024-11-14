import { Provider, ReactReduxContext } from 'react-redux';
import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Router } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import * as reducers from './reducers/index.js';
import getRoutes from './getRoutes.js';

export default (props = {}) => {
  const { base, lang, createHistory, eventSchema } = {
    base: null,
    lang: 'fr',
    createHistory: createBrowserHistory,
    ...props,
  };

  const initState = {};
  const config = {
    base,
    lang,
    eventSchema,
  };

  const history = createHistory();

  const store = createStore(
    combineReducers({
      main: reducers.main.default,
      network: reducers.network.default,
      config: () => config,
    }),
    initState,
    applyMiddleware(thunkMiddleware.withExtraArgument(history)),
  );

  const routes = getRoutes(config.base || '/');

  return (
    <Provider store={store} context={ReactReduxContext}>
      <div>
        <Router history={history}>{renderRoutes(routes)}</Router>
      </div>
    </Provider>
  );
};
