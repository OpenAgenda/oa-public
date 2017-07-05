'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var _callToAction = require('./modules/callToAction');

var _callToAction2 = _interopRequireDefault(_callToAction);

var _reduxForm = require('redux-form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noopReducer = function noopReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return state;
};

exports.default = (0, _redux.combineReducers)({
  res: noopReducer,
  settings: noopReducer,
  form: _reduxForm.reducer,
  callToAction: _callToAction2.default
});
module.exports = exports['default'];