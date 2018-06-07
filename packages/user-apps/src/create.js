"use strict";

const { createStore, compose, applyMiddleware } = require( 'redux' ),

  { routerMiddleware } = require( 'react-router-redux' );


module.exports = ( history, initialState ) => {

  let enhancer;
  const middleware = applyMiddleware( routerMiddleware( history ), promiseMiddleware );

  if ( process.env.NODE_ENV == 'development' && typeof window !== 'undefined' ) {
    const { persistState } = require( 'redux-devtools' ),
      DevTools = require( './containers/DevTools' );

    enhancer = compose(
      middleware,
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState( getDebugSessionKey() )
    );
  } else {
    enhancer = compose( middleware );
  }

  const reducers = require( './reducers/index' );
  // const initialState = typeof window !== 'undefined' ? window.__data : undefined;
  const store = createStore( reducers, initialState, enhancer );

  return store;

};


function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  const matches = window.location.href.match( /[?&]debug_session=([^&#]+)\b/ );
  return (matches && matches.length > 0) ? matches[ 1 ] : null;
}


function promiseMiddleware() {

  return next => action => {

    const { promise, types } = action,

      rest = removeObjectProperties( action, [ 'promise', 'types' ] );

    if ( !promise ) {
      return next( action );
    }

    const [REQUEST, SUCCESS, FAILURE] = types;

    next( Object.assign( {}, rest, { type: REQUEST } ) );

    return promise.then(
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