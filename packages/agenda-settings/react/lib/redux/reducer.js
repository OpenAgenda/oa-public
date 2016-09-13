'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var _reactRouterRedux = require('react-router-redux');

var _reduxConnect = require('redux-connect');

var _reduxForm = require('redux-form');

var _agenda = require('./modules/agenda');

var _agenda2 = _interopRequireDefault(_agenda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _redux.combineReducers)({
  routing: _reactRouterRedux.routerReducer,
  reduxAsyncConnect: _reduxConnect.reducer,
  form: _reduxForm.reducer.plugin({
    agendaCreation: _agenda.formPlugin
  }),
  agenda: _agenda2.default
});
module.exports = exports['default'];