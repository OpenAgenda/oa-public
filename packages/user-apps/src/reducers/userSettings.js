"use strict";

const types = require( '../actions/actionsTypes' );


const initialState = {
  user: null,
  modal: {},
  successMessagesDisplayed: {
    updateProfile: false,
    changeEmail: false,
    changePassword: false
  }
};


function userSettings( state = initialState, action ) {

  switch ( action.type ) {
    case types.GET_ME:
      return getMe( state, action.status, action.data );
    case types.UPDATE_USER:
      return updateUser( state, action.status, action.user );
    case types.GENERATE_APIKEY:
      return generateApiKey( state, action.status, action.data );
    case types.DISPLAY_MODAL:
      return { ...state, modal: action.data };
    case types.DISPLAY_DELETE_ACCOUNT_CONFIRMATION:
      return { ...state, deleteAccountConfirmationIsOpen: action.visible };
    case types.DELETE_ACCOUNT:
      return deleteAccount( state, action.status );
    case types.DISPLAY_MESSAGE:
      return {
        ...state,
        successMessagesDisplayed: { ...state.successMessagesDisplayed, [action.name]: action.visible }
      }
    default:
      return state;
  }

}


function getMe( state, status, data = {} ) {
  switch ( status ) {
    case 'response':
      return { ...state, user: data.user };
    default:
      return state;
  }
}

function updateUser( state, status, user = {} ) {
  switch ( status ) {
    case 'response':
      return { ...state, user: { ...state.user, ...user } };
    default:
      return state;
  }
}

function generateApiKey( state, status, data = {} ) {
  switch ( status ) {
    case 'response':
      return { ...state, user: { ...state.user, [data.secret ? 'api_secret' : 'api_key']: data.key } };
    default:
      return state;
  }
}

function deleteAccount( state, status ) {
  switch ( status ) {
    case 'response':
      return { ...state, user: null }
    default:
      return state;
  }
}


module.exports = userSettings;
