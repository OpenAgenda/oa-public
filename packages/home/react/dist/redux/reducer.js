'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createReducer = require('react-utils/dist/createReducer');

var _createReducer2 = _interopRequireDefault(_createReducer);

var _reduxForm = require('redux-form');

var _agendas = require('./modules/agendas');

var _agendas2 = _interopRequireDefault(_agendas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReducer2.default)({
  form: _reduxForm.reducer,
  agendas: _agendas2.default
});
module.exports = exports['default'];