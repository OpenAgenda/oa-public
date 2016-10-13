'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (reducers) {
  return (0, _redux.combineReducers)(_extends({
    routing: _reactRouterRedux.routerReducer,
    reduxAsyncConnect: _reduxConnect.reducer,
    res: function res() {
      var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return s;
    },
    settings: function settings() {
      var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return s;
    }
  }, reducers));
};

var _redux = require('redux');

var _reactRouterRedux = require('react-router-redux');

var _reduxConnect = require('redux-connect');

module.exports = exports['default'];