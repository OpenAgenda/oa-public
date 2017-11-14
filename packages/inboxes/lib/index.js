'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Conversation = exports.Conversations = exports.InboxUser = exports.InboxUsers = exports.Inbox = exports.init = exports.config = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _Inbox = require('./Inbox');

var _Inbox2 = _interopRequireDefault(_Inbox);

var _InboxUsers = require('./InboxUsers');

var _InboxUsers2 = _interopRequireDefault(_InboxUsers);

var _InboxUser = require('./InboxUser');

var _InboxUser2 = _interopRequireDefault(_InboxUser);

var _Conversations = require('./Conversations');

var _Conversations2 = _interopRequireDefault(_Conversations);

var _Conversation = require('./Conversation');

var _Conversation2 = _interopRequireDefault(_Conversation);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function InboxFactory() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (!(this instanceof InboxFactory)) {
    return new (Function.prototype.bind.apply(InboxFactory, [null].concat(args)))();
  }

  return _Inbox2.default.call.apply(_Inbox2.default, [this].concat(args));
}

_util2.default.inherits(InboxFactory, _Inbox2.default);

(0, _assign2.default)(InboxFactory, _Inbox2.default, {
  user: _Inbox2.default.user,
  config: _config2.default,
  init: _config.init
});

exports.default = InboxFactory;
exports.config = _config2.default;
exports.init = _config.init;
exports.Inbox = _Inbox2.default;
exports.InboxUsers = _InboxUsers2.default;
exports.InboxUser = _InboxUser2.default;
exports.Conversations = _Conversations2.default;
exports.Conversation = _Conversation2.default;
//# sourceMappingURL=index.js.map