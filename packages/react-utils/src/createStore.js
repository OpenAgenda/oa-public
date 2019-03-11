import { combineReducers, createStore } from 'redux';

function inject( store, getReducers, newReducers ) {
  for ( const name in newReducers ) {
    const reducer = newReducers[ name ];

    if ( store.asyncReducers[ name ] ) {
      continue;
    }

    store.asyncReducers[ name ] = reducer.__esModule ? reducer.default : reducer;
  }

  store.replaceReducer( combineReducers( getReducers( store.asyncReducers ) ) );
}

function getNoopReducers( reducers, data ) {
  if ( !data ) {
    return {};
  }

  return Object.keys( data )
    .reduce( ( accu, key ) => {
      if ( reducers[ key ] ) {
        return accu;
      }

      return {
        ...accu,
        [ key ]: ( state = {} ) => state
      };
    }, {} );
}


export default function ( getReducers, initialState, enhancer ) {
  const reducers = getReducers() || {};
  const noopReducers = getNoopReducers( reducers, initialState );
  const rootReducer = combineReducers( { ...noopReducers, ...reducers } );

  const store = createStore( rootReducer, initialState, enhancer );

  store.asyncReducers = {};
  store.inject = inject.bind( null, store, asyncReducers => ({
    ...noopReducers,
    ...getReducers( asyncReducers )
  }) );

  return store;
};
