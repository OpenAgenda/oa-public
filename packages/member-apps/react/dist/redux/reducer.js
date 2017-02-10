'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createReducer = require('react-utils/dist/createReducer');

var _createReducer2 = _interopRequireDefault(_createReducer);

var _reduxForm = require('redux-form');

var _members = require('./modules/members');

var _members2 = _interopRequireDefault(_members);

var _modals = require('./modules/modals');

var _modals2 = _interopRequireDefault(_modals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createReducer2.default)({
  form: _reduxForm.reducer,
  agenda: function agenda() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return state;
  },
  stakeholder: function stakeholder() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return state;
  },
  members: _members2.default,
  modals: _modals2.default
});
module.exports = exports['default'];