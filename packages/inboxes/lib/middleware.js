'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messages = exports.conversations = exports.inboxUser = exports.config = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _bluebird = require('bluebird');

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

exports.init = init;
exports.user = user;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('./');

var _3 = _interopRequireDefault(_2);

var _Conversations = require('./Conversations');

var _Conversations2 = _interopRequireDefault(_Conversations);

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
          namespaces: {
            query: {
              typeIdentifier: 'query.typeIdentifier',
              type: 'query.type'
            }
          },
          limit: 20
        }, options),
            namespaces = _$merge.namespaces,
            params = (0, _objectWithoutProperties3.default)(_$merge, ['namespaces']);

        return wrap(function () {
          var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(req, res) {
            var query, limit, conversations;
            return _regenerator2.default.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    query = _lodash2.default.pickBy({
                      type: _lodash2.default.get(req, namespaces.query.type),
                      typeIdentifier: parseInt(_lodash2.default.get(req, namespaces.query.typeIdentifier))
                    });
                    limit = getLimit(config.mw.limit, params.limit);
                    _context.next = 4;
                    return (0, _bluebird.resolve)(_3.default.user(_lodash2.default.get(req, namespace)).conversations.list(query, (req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit /* options */));

                  case 4:
                    conversations = _context.sent;


                    res.send({ conversations: conversations });

                  case 6:
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

var inboxUser = exports.inboxUser = {
  get: function get(options) {
    var _this2 = this;

    var _$merge2 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        userUid: 'user.uid'
      },
      fallbackGetter: null
    }, options),
        namespaces = _$merge2.namespaces,
        fallbackGetter = _$merge2.fallbackGetter;

    return wrap(function () {
      var _ref2 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(req, res) {
        var inboxIdentifiers, userUid, inbox, inboxUser;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                inboxIdentifiers = {
                  type: _lodash2.default.get(req, namespaces.type),
                  identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                };
                userUid = parseInt(_lodash2.default.get(req, namespaces.userUid));
                _context2.next = 4;
                return (0, _bluebird.resolve)((0, _3.default)(inboxIdentifiers));

              case 4:
                inbox = _context2.sent;
                _context2.next = 7;
                return (0, _bluebird.resolve)(inbox.users.get({ userUid: userUid }));

              case 7:
                inboxUser = _context2.sent;

                if (!(inboxUser && inboxUser.data)) {
                  _context2.next = 18;
                  break;
                }

                _context2.t0 = _assign2.default;
                _context2.t1 = {};
                _context2.t2 = inboxUser.toJSON();
                _context2.next = 14;
                return (0, _bluebird.resolve)(config.interfaces.getUsersDetails([inboxUser.data]));

              case 14:
                _context2.t3 = _context2.sent[0];
                inboxUser = (0, _context2.t0)(_context2.t1, _context2.t2, _context2.t3);
                _context2.next = 22;
                break;

              case 18:
                if (!fallbackGetter) {
                  _context2.next = 22;
                  break;
                }

                _context2.next = 21;
                return (0, _bluebird.resolve)(fallbackGetter({ req: req, inbox: inbox.data, userUid: userUid }));

              case 21:
                inboxUser = _context2.sent;

              case 22:
                _context2.t4 = _assign2.default;
                _context2.t5 = {};
                _context2.t6 = inbox.toJSON();
                _context2.next = 27;
                return (0, _bluebird.resolve)(config.interfaces.getInboxesDetails([inbox.data]));

              case 27:
                _context2.t7 = _context2.sent[0];
                inbox = (0, _context2.t4)(_context2.t5, _context2.t6, _context2.t7);


                res.send({ inbox: inbox, inboxUser: inboxUser });

              case 30:
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
  }
};

var conversations = {
  create: function create(options) {
    var _this3 = this;

    var _$merge3 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        destinationInbox: 'destinationInbox',
        conversationType: 'conversationType',
        conversationTypeIdentifier: 'conversationTypeIdentifier',
        params: 'conversationParams',
        message: 'body.message',
        creatorInboxUser: 'creatorInboxUser',
        options: 'options'
      }
    }, options),
        namespaces = _$merge3.namespaces;

    return wrap(function () {
      var _ref3 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(req, res) {
        var data, optionalData, conversation;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data = {
                  destinationInbox: _lodash2.default.get(req, namespaces.destinationInbox),
                  type: _lodash2.default.get(req, namespaces.conversationType),
                  params: _lodash2.default.get(req, namespaces.params),
                  creatorInboxUser: _lodash2.default.get(req, namespaces.creatorInboxUser),
                  message: _lodash2.default.get(req, namespaces.message)
                };
                optionalData = _lodash2.default.pickBy({
                  typeIdentifier: _lodash2.default.get(req, namespaces.conversationTypeIdentifier)
                });
                _context3.next = 4;
                return (0, _bluebird.resolve)((0, _3.default)({
                  type: _lodash2.default.get(req, namespaces.type),
                  identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                }).conversations.create((0, _extends3.default)({}, data, optionalData), _lodash2.default.get(req, namespaces.options)));

              case 4:
                conversation = _context3.sent;


                res.send({ conversation: conversation });

              case 6:
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
  list: function list(options) {
    var _this4 = this;

    var _$merge4 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        query: {
          typeIdentifier: 'query.typeIdentifier',
          type: 'query.type'
        }
      },
      limit: 20
    }, options),
        namespaces = _$merge4.namespaces,
        params = (0, _objectWithoutProperties3.default)(_$merge4, ['namespaces']);

    return wrap(function () {
      var _ref4 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(req, res) {
        var query, limit, conversations;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                query = _lodash2.default.pickBy({
                  type: _lodash2.default.get(req, namespaces.query.type),
                  typeIdentifier: parseInt(_lodash2.default.get(req, namespaces.query.typeIdentifier))
                });
                limit = getLimit(config.mw.limit, params.limit);
                _context4.next = 4;
                return (0, _bluebird.resolve)(new _3.default({
                  type: _lodash2.default.get(req, namespaces.type),
                  identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                }).conversations.list(query, (req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit /* options */));

              case 4:
                conversations = _context4.sent;


                res.send({ conversations: conversations });

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
  },
  action: function action(options) {
    var _this5 = this;

    var _$merge5 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        userUid: 'user.uid',
        code: 'code'
      }
    }, options),
        namespaces = _$merge5.namespaces;

    return wrap(function () {
      var _ref5 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(req, res) {
        var conversation;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return (0, _bluebird.resolve)(new _Conversations2.default({
                  userUid: parseInt(_lodash2.default.get(req, namespaces.userUid)),
                  inbox: new _3.default({
                    type: _lodash2.default.get(req, namespaces.type),
                    identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                  })
                }).get(parseInt(_lodash2.default.get(req, namespaces.conversationId))));

              case 2:
                conversation = _context5.sent;
                _context5.next = 5;
                return (0, _bluebird.resolve)(conversation.action(_lodash2.default.get(req, namespaces.code), { userUid: _lodash2.default.get(req, namespaces.userUid) }));

              case 5:

                res.send({ conversation: conversation });

              case 6:
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
  resume: function resume(options) {
    var _this6 = this;

    var _$merge6 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        userUid: 'user.uid'
      }
    }, options),
        namespaces = _$merge6.namespaces;

    return wrap(function () {
      var _ref6 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(req, res) {
        var conversation;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return (0, _bluebird.resolve)(new _Conversations2.default({
                  userUid: parseInt(_lodash2.default.get(req, namespaces.userUid)),
                  inbox: new _3.default({
                    type: _lodash2.default.get(req, namespaces.type),
                    identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                  })
                }).get(parseInt(_lodash2.default.get(req, namespaces.conversationId))));

              case 2:
                conversation = _context6.sent;
                _context6.next = 5;
                return (0, _bluebird.resolve)(conversation.update({ closedAt: null }, { userUid: _lodash2.default.get(req, namespaces.userUid) }));

              case 5:

                res.send({ conversation: conversation });

              case 6:
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

exports.conversations = conversations;
var messages = {
  list: function list(options) {
    var _this7 = this;

    var _$merge7 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        userUid: 'user.uid'
      },
      limit: 20
    }, options),
        namespaces = _$merge7.namespaces,
        params = (0, _objectWithoutProperties3.default)(_$merge7, ['namespaces']);

    var limit = getLimit(config.mw.limit, params.limit);

    return wrap(function () {
      var _ref7 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(req, res) {
        var conversation, messages;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return (0, _bluebird.resolve)(new _Conversations2.default({
                  userUid: parseInt(_lodash2.default.get(req, namespaces.userUid)),
                  inbox: new _3.default({
                    type: _lodash2.default.get(req, namespaces.type),
                    identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                  })
                }).get(parseInt(_lodash2.default.get(req, namespaces.conversationId))));

              case 2:
                conversation = _context7.sent;
                _context7.next = 5;
                return (0, _bluebird.resolve)(conversation.messages.list((req.query.page > 0 ? req.query.page - 1 : 0) * limit, limit /* options */));

              case 5:
                messages = _context7.sent;


                res.send({ conversation: conversation, messages: messages });

              case 7:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, _this7);
      }));

      return function (_x13, _x14) {
        return _ref7.apply(this, arguments);
      };
    }());
  },
  create: function create(options) {
    var _this8 = this;

    var _$merge8 = _lodash2.default.merge({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
        conversationId: 'conversation.id',
        userUid: 'user.uid',
        body: 'body.body',
        options: 'options'
      }
    }, options),
        namespaces = _$merge8.namespaces;

    return wrap(function () {
      var _ref8 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(req, res) {
        var conversation, message;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return (0, _bluebird.resolve)(new _Conversations2.default({
                  userUid: parseInt(_lodash2.default.get(req, namespaces.userUid)),
                  inbox: new _3.default({
                    type: _lodash2.default.get(req, namespaces.type),
                    identifier: parseInt(_lodash2.default.get(req, namespaces.identifier))
                  })
                }).get(parseInt(_lodash2.default.get(req, namespaces.conversationId))));

              case 2:
                conversation = _context8.sent;
                _context8.next = 5;
                return (0, _bluebird.resolve)(conversation.messages.create({
                  body: _lodash2.default.get(req, namespaces.body),
                  userUid: _lodash2.default.get(req, namespaces.userUid)
                }, _lodash2.default.get(req, namespaces.options)));

              case 5:
                message = _context8.sent;


                res.send({ message: message });

              case 7:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, _this8);
      }));

      return function (_x15, _x16) {
        return _ref8.apply(this, arguments);
      };
    }());
  }
};

/* Utils */

exports.messages = messages;
function wrap(fn) {
  return function (req, res, next) {
    return fn(req, res, next).catch(next);
  };
}

function getLimit(max, limit) {
  limit = parseInt(limit);

  if (!limit) {
    return max;
  }

  return limit > max ? max : limit;
}
//# sourceMappingURL=middleware.js.map