import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';

export default function ( history, client, state = {} ) {

  let enhancer;
  const middleware = applyMiddleware( routerMiddleware( history ), promiseMiddleware( client, state ) );

  if ( process.env.NODE_ENV == 'development' && typeof window !== 'undefined' ) {
    const { persistState } = require( 'redux-devtools' ),
      DevTools = require( '../containers/DevTools/DevTools' );

    enhancer = compose(
      middleware,
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState( getDebugSessionKey() )
    );
  } else {
    enhancer = compose( middleware );
  }

  const reducers = require( './reducer' );
  const initialState = typeof window !== 'undefined' ? window.__data : {};
  const store = createStore( reducers, Object.assign( {}, state, initialState ), enhancer );

  return store;

};

function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  const matches = window.location.href.match( /[?&]debug_session=([^&#]+)\b/ );
  return (matches && matches.length > 0) ? matches[ 1 ] : null;
}

function promiseMiddleware( client ) {

  return store => next => action => {

    const { promise, types } = action;
    const rest = removeObjectProperties( action, [ 'promise', 'types' ] );

    if ( !promise ) {
      return next( action );
    }

    const [REQUEST, SUCCESS, FAILURE] = types;

    next( Object.assign( {}, rest, { type: REQUEST } ) );

    return promise( client, store.getState() )
      .then(
        result => next( Object.assign( {}, rest, { result, type: SUCCESS } ) ),
        error => next( Object.assign( {}, rest, { error, type: FAILURE } ) )
      );

  };

}

function removeObjectProperties( obj, keys ) {

  var target = {};

  for ( var i in obj ) {

    if ( keys.indexOf( i ) >= 0 ) continue;

    if ( !Object.prototype.hasOwnProperty.call( obj, i ) ) continue;

    target[ i ] = obj[ i ];

  }

  return target;

}