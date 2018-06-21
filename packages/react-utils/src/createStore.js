import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';

export default function ( reducers ) {

  return ( history, client, state = {} ) => {

    let enhancer;
    const middleware = applyMiddleware( routerMiddleware( history ), funcMiddleware(), promiseMiddleware( client ) );

    if ( process.env.NODE_ENV === 'development' && typeof window !== 'undefined' ) {
      const { persistState } = require( 'redux-devtools' );
      const { composeWithDevTools } = require( 'redux-devtools-extension' );

      enhancer = composeWithDevTools({})( middleware, persistState( getDebugSessionKey() ) );
    } else {
      enhancer = compose( middleware );
    }

    return createStore( reducers, state, enhancer );

  };

}

function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  const matches = window.location.href.match( /[?&]debug_session=([^&#]+)\b/ );
  return (matches && matches.length > 0) ? matches[ 1 ] : null;
}

function funcMiddleware() {

  return store => next => action => {

    if ( typeof action !== 'function' ) return next( action );

    return next( action( store ) );

  };

}

function promiseMiddleware( client ) {

  return store => next => action => {

    const { promise, types, ...rest } = action;

    if ( !promise ) {
      return next( action );
    }

    const [ REQUEST, SUCCESS, FAILURE ] = types;

    next( { ...rest, type: REQUEST } );

    try {

      const actionPromise = promise( client, store.getState() );

      actionPromise.then(
        result => next( { ...rest, result, type: SUCCESS } ),
        error => next( { ...rest, error, type: FAILURE } )
      );

      return actionPromise;

    } catch ( error ) {

      console.error( 'MIDDLEWARE ERROR:', error );

      return Promise.reject( next( { ...rest, error, type: FAILURE } ) );

    }

  };

}
