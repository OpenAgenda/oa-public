'use strict';

var _require = require('redux');

var combineReducers = _require.combineReducers;

var _require2 = require('react-router-redux');

var routerReducer = _require2.routerReducer;

var _require3 = require('redux-form');

var form = _require3.reducer;

var app = require('./app');

var userSettings = require('./userSettings');

module.exports = combineReducers({
  routing: routerReducer,
  form: form,
  app: app,
  userSettings: userSettings
});