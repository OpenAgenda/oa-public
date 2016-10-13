import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';

export default function ( reducers ) {
  return combineReducers( {
    routing: routerReducer,
    reduxAsyncConnect,
    res: ( s = {} ) => s,
    settings: ( s = {} ) => s,
    ...reducers
  } );
}
