"use strict";

const types = require( '../actions/actionsTypes' );


const initialState = {
  user: null
};


function userSettings( state = initialState, action ) {

  switch ( action.type ) {
    case types.GET_ME:
      return getMe( state, action.status, action.data );
    case types.UPDATE_PROFILE:
      return updateProfile( state, action.status, action.data );
    case types.CHANGE_EMAIL:
      return changeEmail( state, action.status, action.data );
    case types.CHANGE_PASSWORD:
      return changePassword( state, action.status, action.data );
    default:
      return state;
  }

}


function getMe( state, status, data = {} ) {
  switch ( status ) {
    case 'response':
      return Object.assign( {}, state, { user: data.user } );
    default:
      return state;
  }
}


function updateProfile( state, status, data = {} ) {
  switch ( status ) {
    case 'response':
      return Object.assign( {}, state );
    default:
      return state;
  }
}


function changeEmail( state, status, data = {} ) {
  switch ( status ) {
    case 'response':
      return Object.assign( {}, state );
    default:
      return state;
  }
}


function changePassword( state, status, data = {} ) {
  switch ( status ) {
    case 'response':
      return Object.assign( {}, state );
    default:
      return state;
  }
}


module.exports = userSettings;