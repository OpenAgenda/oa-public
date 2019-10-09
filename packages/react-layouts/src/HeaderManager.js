import React from 'react';
import { applyMiddleware, compose } from 'redux';
import createStore from '@openagenda/react-utils/dist/createStore';
import apiClient from '@openagenda/react-utils/dist/apiClient';
import clientMiddleware from '@openagenda/react-utils/dist/clientMiddleware';
import Context from './contexts/header';
import headerReducer from './reducers/header';


const HeaderManager = ({ children, store }) => (
  <Context.Provider value={store}>
    {children}
  </Context.Provider>
);

HeaderManager.createStore = initialState => {
  const client = apiClient(initialState.header.apiRoot);

  return createStore(
    () => ({ header: headerReducer }),
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware({ client })
      ),
      __CLIENT__ && __DEVELOPMENT__ && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : v => v
    )
  );
};

HeaderManager.Context = Context;

export default HeaderManager;
