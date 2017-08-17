"use strict";

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends4 = require('babel-runtime/helpers/extends');

var _extends5 = _interopRequireDefault(_extends4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      return (0, _extends5.default)({}, state, { modal: action.data });
    case types.DISPLAY_DELETE_ACCOUNT_CONFIRMATION:
      return (0, _extends5.default)({}, state, { deleteAccountConfirmationIsOpen: action.visible });
    case types.DELETE_ACCOUNT:
      return deleteAccount(state, action.status);
    case types.DISPLAY_MESSAGE:
      return (0, _extends5.default)({}, state, {
        successMessagesDisplayed: (0, _extends5.default)({}, state.successMessagesDisplayed, (0, _defineProperty3.default)({}, action.name, action.visible))
      });
    case types.LIST_UNSUBSCRIPTIONS:
      return listUnsubscriptions(state, action.status, action.data);
    case types.REMOVE_UNSUBSCRIPTION:
      return removeUnsubscription(state, action.status, action.data);
    default:
      return state;
  }
}

function removeUnsubscription(state, status) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  switch (status) {
    case 'response':
      return (0, _extends5.default)({}, state, {
        unsubscriptions: state.unsubscriptions.filter(function (v) {
          return v.id !== data.unsubscription.id;
        })
      });
    default:
      return state;
  }
}

function listUnsubscriptions(state, status) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  switch (status) {
    case 'response':
      return (0, _extends5.default)({}, state, { unsubscriptions: data.unsubscriptions });
    default:
      return state;
  }
}

function getMe(state, status) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  switch (status) {
    case 'response':
      return (0, _extends5.default)({}, state, { user: data.user });
    default:
      return state;
  }
}

function updateUser(state, status) {
  var user = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  switch (status) {
    case 'response':
      return (0, _extends5.default)({}, state, { user: (0, _extends5.default)({}, state.user, user) });
    default:
      return state;
  }
}

function generateApiKey(state, status) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  switch (status) {
    case 'response':
      return (0, _extends5.default)({}, state, { user: (0, _extends5.default)({}, state.user, (0, _defineProperty3.default)({}, data.secret ? 'api_secret' : 'api_key', data.key)) });
    default:
      return state;
  }
}

function deleteAccount(state, status) {
  switch (status) {
    case 'response':
      return (0, _extends5.default)({}, state, { user: null });
    default:
      return state;
  }
}

module.exports = userSettings;
//# sourceMappingURL=userSettings.js.map