import { combineReducers, createStore } from 'redux';

function inject( store, getReducers, newReducers ) {
  Object.entries( newReducers ).forEach( ( [ name, reducer ] ) => {
    if ( store.asyncReducers[ name ] ) {
      return;
    }

    store.asyncReducers[ name ] = reducer.__esModule ? reducer.default : reducer;
  } );

  store.replaceReducer( combineReducers( getReducers( store.asyncReducers ) ) );
}

function getNoopReducers( reducers, data ) {
  if ( !data ) {
    return {};
  }

  return Object.keys( data ).reduce(
    ( prev, next ) => {
      if ( reducers[ next ] ) {
        return prev;
      }

      return {
        ...prev,
        [ next ]: ( state = {} ) => state
      };
    },
    {}
  );
}


export default function ( getReducers, initialState, enhancer ) {
  const reducers = getReducers();
  const noopReducers = getNoopReducers( reducers, initialState );
  const rootReducer = combineReducers( { ...noopReducers, ...reducers } );

  const store = createStore( rootReducer, initialState, enhancer );

  store.asyncReducers = {};
  store.inject = inject.bind( store, getReducers );

  return store;
};
