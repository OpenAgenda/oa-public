"use strict";

const { createStore, compose, applyMiddleware } = require( 'redux' ),

  { routerMiddleware } = require( 'react-router-redux' ),

  { persistState } = require( 'redux-devtools' ),

  DevTools = require( '../containers/DevTools' );


module.exports = ( history, env = 'prod' ) => {

  var enhancer;

  if ( env == 'dev' ) {
    enhancer = compose(
      applyMiddleware( routerMiddleware( history ), promiseMiddleware ),
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState( getDebugSessionKey() )
    );
  } else {
    enhancer = compose(
      applyMiddleware( routerMiddleware( history ), promiseMiddleware )
    );
  }

  const reducers = require( './../reducers/index' );
  const store = createStore( reducers, window.__data, enhancer );

  return store;

};


function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  const matches = window.location.href.match( /[?&]debug_session=([^&#]+)\b/ );
  return (matches && matches.length > 0) ? matches[ 1 ] : null;
}


function promiseMiddleware() {

  return ( next ) => ( action ) => {

    const { promise, types } = action,

      rest = removeObjectProperties( action, [ "promise", "types" ] );

    if ( !promise ) {
      return next( action );
    }

    const [REQUEST, SUCCESS, FAILURE] = types;

    next( Object.assign( {}, rest, { type: REQUEST } ) );

    return promise.then(
      ( result ) => next( Object.assign( {}, rest, { result, type: SUCCESS } ) ),
      ( error ) => next( Object.assign( {}, rest, { error, type: FAILURE } ) )
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