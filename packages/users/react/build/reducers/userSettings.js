"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var types = require('../actions/actionsTypes');

var initialState = {
  user: null,
  modal: {},
  successMessagesDisplayed: {
    updateProfile: false,
    changeEmail: false,
    changePassword: false
  }
};

function userSettings() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];


  switch (action.type) {
    case types.GET_ME:
      return getMe(state, action.status, action.data);
    case types.UPDATE_USER:
      return updateUser(state, action.status, action.user);
    case types.GENERATE_APIKEY:
      return generateApiKey(state, action.status, action.data);
    case types.DISPLAY_MODAL:
      return _extends({}, state, { modal: action.data });
    case types.DISPLAY_DELETE_ACCOUNT_CONFIRMATION:
      return _extends({}, state, { deleteAccountConfirmationIsOpen: action.visible });
    case types.DELETE_ACCOUNT:
      return deleteAccount(state, action.status);
    case types.DISPLAY_MESSAGE:
      return _extends({}, state, { successMessagesDisplayed: _extends({}, state.successMessagesDisplayed, _defineProperty({}, action.name, action.visible)) });
    default:
      return state;
  }
}

function getMe(state, status) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  switch (status) {
    case 'response':
      return _extends({}, state, { user: data.user });
    default:
      return state;
  }
}

function updateUser(state, status) {
  var user = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  switch (status) {
    case 'response':
      return _extends({}, state, { user: _extends({}, state.user, user) });
    default:
      return state;
  }
}

function generateApiKey(state, status) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  switch (status) {
    case 'response':
      return _extends({}, state, { user: _extends({}, state.user, _defineProperty({}, data.secret ? 'api_secret' : 'api_key', data.key)) });
    default:
      return state;
  }
}

function deleteAccount(state, status) {
  switch (status) {
    case 'response':
      return _extends({}, state, { user: null });
    default:
      return state;
  }
}

module.exports = userSettings;