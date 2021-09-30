import { combineReducers, createStore } from 'redux';

const noopReducer = asyncReducers => asyncReducers;

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
        [ key ]: ( state = data[ key ] ) => state
      };
    }, {} );
}


export default function ( getReducers, initialState, enhancer ) {
  const getter = getReducers || noopReducer;
  const reducers = getter() || {};
  const noopReducers = getNoopReducers( reducers, initialState );
  const rootReducer = combineReducers( { ...noopReducers, ...reducers } );

  const store = createStore( rootReducer, initialState, enhancer );

  store.asyncReducers = {};
  store.inject = inject.bind( null, store, asyncReducers => ({
    ...noopReducers,
    ...getter( asyncReducers )
  }) );

  return store;
};
