import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';

export default function ( history, client, state = {} ) {

  let enhancer;
  const middleware = applyMiddleware( routerMiddleware( history ), promiseMiddleware( client, state ) );

  if ( process.env.NODE_ENV == 'development' && typeof window !== 'undefined' ) {
    enhancer = compose(
      middleware,
      window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : v => v
    );
  } else {
    enhancer = compose( middleware );
  }

  const reducers = require( './reducer' );
  const initialState = typeof window !== 'undefined' ? window.__data : {};
  const store = createStore( reducers, Object.assign( {}, state, initialState ), enhancer );

  return store;

};

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
