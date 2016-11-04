"use strict";

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
      return Object.assign({}, state, { appSettings: action.settings });
    case types.SET_LOADING:
      return Object.assign({}, state, { loading: action.loading });
    default:
      return state;
  }
}

module.exports = app;