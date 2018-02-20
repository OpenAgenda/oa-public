'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createReducer = require('@openagenda/react-utils/dist/createReducer');

var _createReducer2 = _interopRequireDefault(_createReducer);

var _reduxForm = require('redux-form');

var _inbox = require('./modules/inbox');

var _inbox2 = _interopRequireDefault(_inbox);

var _conversation = require('./modules/conversation');

var _conversation2 = _interopRequireDefault(_conversation);

var _conversationForm = require('./modules/conversationForm');

var _conversationForm2 = _interopRequireDefault(_conversationForm);

var _modals = require('./modules/modals');

var _modals2 = _interopRequireDefault(_modals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noop = function noop() {
  var v = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  return v;
};

exports.default = (0, _createReducer2.default)({
  form: _reduxForm.reducer,
  inbox: _inbox2.default,
  conversation: _conversation2.default,
  conversationForm: _conversationForm2.default,
  modals: _modals2.default,
  user: noop,
  agenda: noop,
  event: noop
});
module.exports = exports['default'];
//# sourceMappingURL=reducer.js.map