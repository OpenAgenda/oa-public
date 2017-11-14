'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.conversations = exports.config = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _bluebird = require('bluebird');

exports.init = init;
exports.user = user;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('./');

var _3 = _interopRequireDefault(_2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = exports.config = void 0;

function init(c) {
  exports.config = config = c;
}

/******************/
/* User enpoints  */

/******************/

function user(namespace) {
  return {
    conversations: {
      list: function list(options) {
        var _this = this;

        var _$merge = _lodash2.default.merge({
          limit: 20
        }, options),
            limit = _$merge.limit;

        return wrap(function () {
          var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(req, res) {
            var conversations;
            return _regenerator2.default.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return (0, _bluebird.resolve)(_3.default.user(_lodash2.default.get(req, namespace)).conversations.list((req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit /* options */));

                  case 2:
                    conversations = _context.sent;


                    res.send({ conversations: conversations });

                  case 4:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, _this);
          }));

          return function (_x, _x2) {
            return _ref.apply(this, arguments);
          };
        }());
      }
    }
  };
}

/******************/
/* Other enpoints */
/******************/

var conversations = exports.conversations = {
  create: function create(options) {
    var _this2 = this;

    var _$merge2 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        destinationInbox: {
          type: 'destinationInbox.type',
          identifier: 'destinationInbox.identifier'
        },
        conversationType: 'conversationType',
        params: 'conversationParams',
        message: 'body.message',
        creatorInboxUser: 'creatorInboxUser'
      }
    }, options),
        namespaces = _$merge2.namespaces;

    return wrap(function () {
      var _ref2 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(req, res) {
        var conversation;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _bluebird.resolve)((0, _3.default)({
                  type: _lodash2.default.get(req, namespaces.type),
                  identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                }).conversations.create({
                  destinationInbox: {
                    type: _lodash2.default.get(req, namespaces.destinationInbox.type),
                    identifier: parseInt(_lodash2.default.get(req, namespaces.destinationInbox.identifier))
                  },
                  type: _lodash2.default.get(req, namespaces.conversationType),
                  params: _lodash2.default.get(req, namespaces.params),
                  creatorInboxUser: _lodash2.default.get(req, namespaces.creatorInboxUser),
                  message: _lodash2.default.get(req, namespaces.message)
                }));

              case 2:
                conversation = _context2.sent;


                res.send({ conversation: conversation });

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this2);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  },
  list: function list(options) {
    var _this3 = this;

    var _$merge3 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier'
      },
      limit: 20
    }, options),
        namespaces = _$merge3.namespaces,
        limit = _$merge3.limit;

    return wrap(function () {
      var _ref3 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(req, res) {
        var conversations;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (0, _bluebird.resolve)(new _3.default({
                  type: _lodash2.default.get(req, namespaces.type),
                  identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                }).conversations.list((req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit /* options */));

              case 2:
                conversations = _context3.sent;


                res.send({ conversations: conversations });

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this3);
      }));

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());
  },
  action: function action(options) {
    var _this4 = this;

    var _$merge4 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        userUid: 'user.uid',
        code: 'code'
      }
    }, options),
        namespaces = _$merge4.namespaces;

    return wrap(function () {
      var _ref4 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(req, res) {
        var conversation;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return (0, _bluebird.resolve)(new _3.default({
                  type: _lodash2.default.get(req, namespaces.type),
                  identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                }).conversations.get(parseInt(_lodash2.default.get(req, namespaces.conversationId))));

              case 2:
                conversation = _context4.sent;
                _context4.next = 5;
                return (0, _bluebird.resolve)(conversation.action(_lodash2.default.get(req, namespaces.code), { userUid: _lodash2.default.get(req, namespaces.userUid) }));

              case 5:

                res.send({ conversation: conversation });

              case 6:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this4);
      }));

      return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }());
  }
};

var messages = exports.messages = {
  list: function list(options) {
    var _this5 = this;

    var _$merge5 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id'
      },
      limit: 20
    }, options),
        namespaces = _$merge5.namespaces,
        limit = _$merge5.limit;

    return wrap(function () {
      var _ref5 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(req, res) {
        var conversation, messages;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return (0, _bluebird.resolve)(new _3.default({
                  type: _lodash2.default.get(req, namespaces.type),
                  identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                }).conversations.get(parseInt(_lodash2.default.get(req, namespaces.conversationId))));

              case 2:
                conversation = _context5.sent;
                _context5.next = 5;
                return (0, _bluebird.resolve)(conversation.messages.list((req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit /* options */));

              case 5:
                messages = _context5.sent;


                res.send({ conversation: conversation, messages: messages });

              case 7:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, _this5);
      }));

      return function (_x9, _x10) {
        return _ref5.apply(this, arguments);
      };
    }());
  },
  create: function create(options) {
    var _this6 = this;

    var _$merge6 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        userUid: 'user.uid',
        body: 'body.body'
      }
    }, options),
        namespaces = _$merge6.namespaces;

    return wrap(function () {
      var _ref6 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(req, res) {
        var conversation, message;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return (0, _bluebird.resolve)(new _3.default({
                  type: _lodash2.default.get(req, namespaces.type),
                  identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                }).conversations.get(parseInt(_lodash2.default.get(req, namespaces.conversationId))));

              case 2:
                conversation = _context6.sent;
                _context6.next = 5;
                return (0, _bluebird.resolve)(conversation.messages.create({
                  body: _lodash2.default.get(req, namespaces.body),
                  userUid: _lodash2.default.get(req, namespaces.userUid)
                }));

              case 5:
                message = _context6.sent;


                res.send({ message: message });

              case 7:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, _this6);
      }));

      return function (_x11, _x12) {
        return _ref6.apply(this, arguments);
      };
    }());
  }
};

/* Utils */

function wrap(fn) {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  };
}
//# sourceMappingURL=middleware.js.map