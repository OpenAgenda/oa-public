'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createReducer = require('react-utils/dist/createReducer');

var _createReducer2 = _interopRequireDefault(_createReducer);

var _reduxForm = require('redux-form');

var _sources = require('./modules/sources');

var _sources2 = _interopRequireDefault(_sources);

var _modals = require('./modules/modals');

var _modals2 = _interopRequireDefault(_modals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReducer2.default)({
  agenda: function agenda() {
    var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return s;
  },
  form: _reduxForm.reducer,
  sources: _sources2.default,
  modals: _modals2.default
});
module.exports = exports['default'];