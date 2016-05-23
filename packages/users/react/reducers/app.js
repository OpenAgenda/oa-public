"use strict";

const types = require( '../actions/actionsTypes' );


const initialState = {
  appSettings: {},
  loading: false
};


function app( state = initialState, action ) {

  switch ( action.type ) {
    case types.SET_APP_SETTINGS:
      return Object.assign( {}, state, { appSettings: action.settings } );
    case types.LOADING:
      return Object.assign( {}, state, { loading: action.loading } );
    default:
      return state;
  }

}


module.exports = app;