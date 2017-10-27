'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createReducer = require('@openagenda/react-utils/dist/createReducer');

var _createReducer2 = _interopRequireDefault(_createReducer);

var _reduxForm = require('redux-form');

var _menu = require('./modules/menu');

var _menu2 = _interopRequireDefault(_menu);

var _agendas = require('./modules/agendas');

var _agendas2 = _interopRequireDefault(_agendas);

var _events = require('./modules/events');

var _events2 = _interopRequireDefault(_events);

var _modals = require('./modules/modals');

var _modals2 = _interopRequireDefault(_modals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReducer2.default)({
  form: _reduxForm.reducer,
  modals: _modals2.default,
  menu: _menu2.default,
  agendas: _agendas2.default,
  events: _events2.default
});
module.exports = exports['default'];
//# sourceMappingURL=reducer.js.map