import React from 'react';
import { applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import createStore from '@openagenda/react-utils/dist/createStore';
import apiClient from '@openagenda/react-utils/dist/apiClient';
import clientMiddleware from '@openagenda/react-utils/dist/clientMiddleware';
import layoutReducer from './reducers/main';
import agendaAdminReducer from './reducers/agendaAdmin';
import Layout from './Layout';


function LayoutManager({ store, apps, onError, FallbackComponent, children }) {
  return (
    <Provider store={store}>
      <Layout apps={apps} onError={onError} FallbackComponent={FallbackComponent}>
        {children}
      </Layout>
    </Provider>
  );
}

LayoutManager.createStore = (initialState, history) => {
  const helpers = {};
  const client = apiClient(initialState.main.apiRoot);

  const store = createStore(
    asyncReducers => ({
      main: layoutReducer,
      agendaAdmin: agendaAdminReducer,
      ...asyncReducers
    }),
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

  Object.assign(helpers, {
    client,
    store,
    history,
    location: history.location
  });

  return store;
};

export default LayoutManager;
