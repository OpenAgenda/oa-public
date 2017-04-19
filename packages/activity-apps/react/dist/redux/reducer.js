'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createReducer = require('react-utils/dist/createReducer');

var _createReducer2 = _interopRequireDefault(_createReducer);

var _reduxForm = require('redux-form');

var _modals = require('./modules/modals');

var _modals2 = _interopRequireDefault(_modals);

var _activities = require('./modules/activities');

var _activities2 = _interopRequireDefault(_activities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noopReducer = function noopReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return state;
};

exports.default = (0, _createReducer2.default)({
  form: _reduxForm.reducer,
  agenda: noopReducer,
  modals: _modals2.default,
  activities: _activities2.default
});
module.exports = exports['default'];