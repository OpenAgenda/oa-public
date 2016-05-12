"use strict";

const types = require( '../actions/actionsTypes' );


const initialState = {};


function userSettings( state = initialState, action ) {

  switch ( action.type ) {
    //
    default:
      return state;
  }

}

/*function login( state, status, data ) {
  switch ( status ) {
    case 'response':
      return Object.assign( {}, state, { token: data.access_token, logged: true } );
    default:
      return state;
  }
}*/


module.exports = userSettings;