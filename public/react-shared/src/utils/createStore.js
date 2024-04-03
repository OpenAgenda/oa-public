import { combineReducers, createStore } from 'redux';

const noopReducer = injectedReducers => injectedReducers;

function inject(store, getReducers, newReducers) {
  for (const name in newReducers) {
    if (!Object.hasOwnProperty.call(newReducers, name)) {
      continue;
    }

    const reducer = newReducers[name];

    if (store.injectedReducers[name]) {
      continue;
    }

    store.injectedReducers[name] = reducer.__esModule
      ? reducer.default
      : reducer;
  }

  store.replaceReducer(combineReducers(getReducers(store.injectedReducers)));
}

function getNoopReducers(reducers, data) {
  if (!data) {
    return {};
  }

  return Object.keys(data).reduce((accu, key) => {
    if (reducers[key]) {
      return accu;
    }

    return {
      ...accu,
      [key]: (state = data[key]) => state,
    };
  }, {});
}

export default (getReducers, initialState, enhancer) => {
  const getter = getReducers || noopReducer;
  const reducers = getter() || {};
  const noopReducers = getNoopReducers(reducers, initialState);
  const rootReducer = combineReducers({ ...noopReducers, ...reducers });

  const store = createStore(rootReducer, initialState, enhancer);

  store.injectedReducers = {};
  store.inject = inject.bind(null, store, injectedReducers => ({
    ...noopReducers,
    ...getter(injectedReducers),
  }));

  return store;
};
