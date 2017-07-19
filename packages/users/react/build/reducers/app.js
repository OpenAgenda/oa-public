"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var types = require('../actions/actionsTypes');

var initialState = {
  appSettings: {},
  loading: true
};

function app() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];


  switch (action.type) {
    case types.SET_APP_SETTINGS:
      return (0, _assign2.default)({}, state, { appSettings: action.settings });
    case types.SET_LOADING:
      return (0, _assign2.default)({}, state, { loading: action.loading });
    default:
      return state;
  }
}

module.exports = app;