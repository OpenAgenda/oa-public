'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var noopReducer = function noopReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return state;
};

exports.default = (0, _redux.combineReducers)({
  res: noopReducer,
  settings: noopReducer
});
module.exports = exports['default'];