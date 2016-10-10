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

var _modal = require('./modules/modal');

var _modal2 = _interopRequireDefault(_modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _redux.combineReducers)({
  routing: _reactRouterRedux.routerReducer,
  reduxAsyncConnect: _reduxConnect.reducer,
  form: _reduxForm.reducer.plugin({
    agendaCreation: _agenda.formPlugin
  }),
  res: function res() {
    var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return s;
  },
  settings: function settings() {
    var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return s;
  },
  agenda: _agenda2.default,
  modal: _modal2.default
});
module.exports = exports['default'];