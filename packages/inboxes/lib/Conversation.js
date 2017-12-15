'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _bluebird = require('bluebird');

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _verror = require('verror');

var _verror2 = _interopRequireDefault(_verror);

var _ajv = require('ajv');

var _ajv2 = _interopRequireDefault(_ajv);

var _ajvErrors = require('ajv-errors');

var _ajvErrors2 = _interopRequireDefault(_ajvErrors);

var _ajvKeywords = require('ajv-keywords');

var _ajvKeywords2 = _interopRequireDefault(_ajvKeywords);

var _logs = require('@openagenda/logs');

var _logs2 = _interopRequireDefault(_logs);

var _config = require('./config');

var _mapper = require('./utils/mapper');

var _mapper2 = _interopRequireDefault(_mapper);

var _conversationFieldsMap = require('./db/conversationFieldsMap');

var _conversationFieldsMap2 = _interopRequireDefault(_conversationFieldsMap);

var _validate = require('./utils/validate');

var _validate2 = _interopRequireDefault(_validate);

var _conversationSchemas = require('./validators/conversationSchemas');

var _Inbox = require('./Inbox');

var _Inbox2 = _interopRequireDefault(_Inbox);

var _Messages = require('./Messages');

var _Messages2 = _interopRequireDefault(_Messages);

var _InboxUser = require('./InboxUser');

var _InboxUser2 = _interopRequireDefault(_InboxUser);

var _populateParticipants = require('./db/populateParticipants');

var _populateParticipants2 = _interopRequireDefault(_populateParticipants);

var _populateLatestMessage = require('./db/populateLatestMessage');

var _populateLatestMessage2 = _interopRequireDefault(_populateLatestMessage);

var _inboxUserFieldsMap = require('./db/inboxUserFieldsMap');

var _inboxUserFieldsMap2 = _interopRequireDefault(_inboxUserFieldsMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _logs2.default)('inboxes/Conversation');

var ajv = new _ajv2.default({ allErrors: true, jsonPointers: true, errorDataPath: 'property' });
(0, _ajvErrors2.default)(ajv);
(0, _ajvKeywords2.default)(ajv, ['instanceof']);

var Conversation = function () {
  function Conversation(identifiers, options) {
    (0, _classCallCheck3.default)(this, Conversation);

    if (typeof identifiers === 'number') {
      identifiers = { id: identifiers };
    }

    this.identifiers = identifiers;
    this.inbox = options && options.inbox;
    this.userUid = options && options.userUid;
    this.messages = new _Messages2.default({ conversation: this, inbox: this.inbox, userUid: this.userUid });
  }

  (0, _createClass3.default)(Conversation, [{
    key: 'create',
    value: function () {
      var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(data, options) {
        var _this = this;

        var params, inboxUser, destinationInboxes, destinationNotFound, protectedData, _ref2, _ref3, insertedId;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                params = _lodash2.default.merge({
                  createInboxUserOnNull: false
                }, options);
                _context2.next = 3;
                return (0, _bluebird.resolve)(this._loadInbox());

              case 3:
                _context2.next = 5;
                return (0, _bluebird.resolve)(this._getInboxUser(this.userUid ? { userUid: this.userUid } : data.creatorInboxUser, { inbox: this.inbox, createOnNull: params.createInboxUserOnNull }));

              case 5:
                inboxUser = _context2.sent;

                if (inboxUser.data) {
                  _context2.next = 8;
                  break;
                }

                throw new _verror2.default('Inbox user %j not found', inboxUser.identifiers);

              case 8:
                _context2.next = 10;
                return (0, _bluebird.resolve)((0, _bluebird.all)([].concat(data.destinationInbox).map(function (v) {
                  return new _Inbox2.default(v).get();
                })));

              case 10:
                destinationInboxes = _context2.sent;
                destinationNotFound = destinationInboxes.filter(function (v) {
                  return !v.data;
                });

                if (!(destinationNotFound && destinationNotFound.length)) {
                  _context2.next = 14;
                  break;
                }

                throw new _verror2.default('Destination Inbox(es) %j not found', destinationNotFound);

              case 14:

                (0, _validate2.default)(ajv, _conversationSchemas.createSchema, _lodash2.default.omit(data, 'destinationInbox', 'creatorInboxUser'));

                if (!(!_config.types || !_config.types[data.type])) {
                  _context2.next = 17;
                  break;
                }

                throw new _verror2.default('Unknow conversation type %s', data.type);

              case 17:
                protectedData = (0, _extends3.default)({
                  store: { params: data.params || {} }
                }, _lodash2.default.pick(data, 'type', 'typeIdentifier'));


                data = _lodash2.default.omit(data, 'params', 'destinationInbox', 'creatorInboxUser');

                _context2.next = 21;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.conversation).insert((0, _extends3.default)({}, _mapper2.default.toDb(_conversationFieldsMap2.default, 'insert', data, options), _mapper2.default.toDb(_conversationFieldsMap2.default, 'insert', protectedData, { protected: false }), {
                  creator_inbox_user_id: inboxUser.data.id
                })));

              case 21:
                _ref2 = _context2.sent;
                _ref3 = (0, _slicedToArray3.default)(_ref2, 1);
                insertedId = _ref3[0];


                this.identifiers = { id: insertedId };

                _context2.next = 27;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inboxConversation).insert({
                  inbox_id: this.inbox.data.id,
                  conversation_id: this.identifiers.id
                }));

              case 27:
                _context2.next = 29;
                return (0, _bluebird.resolve)((0, _bluebird.all)(destinationInboxes.map(function () {
                  var _ref4 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(destinationInbox) {
                    return _regenerator2.default.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            if (!(_this.inbox.data.id !== destinationInbox.data.id)) {
                              _context.next = 3;
                              break;
                            }

                            _context.next = 3;
                            return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inboxConversation).insert({
                              inbox_id: destinationInbox.data.id,
                              conversation_id: _this.identifiers.id
                            }));

                          case 3:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, _this);
                  }));

                  return function (_x3) {
                    return _ref4.apply(this, arguments);
                  };
                }())));

              case 29:
                if (!data.message) {
                  _context2.next = 32;
                  break;
                }

                _context2.next = 32;
                return (0, _bluebird.resolve)(this.messages.create({
                  body: data.message,
                  userUid: inboxUser.data.userUid
                }));

              case 32:
                return _context2.abrupt('return', this.get(options));

              case 33:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function create(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'get',
    value: function () {
      var _ref5 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(options) {
        var request, row, result;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (0, _bluebird.resolve)(this._loadInbox());

              case 2:

                (0, _validate2.default)(ajv, _conversationSchemas.identifiersSchema, this.identifiers);

                request = (0, _config.knex)(_config.schemas.conversation).first().column(_mapper2.default.listFields(_conversationFieldsMap2.default, 'select', 'db', options, true).map(function (v) {
                  return _config.schemas.conversation + '.' + v;
                })).column(_config.schemas.inbox + '.id as inboxContextId').max(_config.schemas.message + '.id as latestMessageId').leftJoin(_config.schemas.inboxConversation, _config.schemas.conversation + '.id', _config.schemas.inboxConversation + '.conversation_id').leftJoin(_config.schemas.inbox, _config.schemas.inbox + '.id', _config.schemas.inboxConversation + '.inbox_id').leftJoin(_config.schemas.message, _config.schemas.message + '.conversation_id', _config.schemas.conversation + '.id').where(_lodash2.default.mapKeys(_mapper2.default.toDb(_conversationFieldsMap2.default, 'select', this.identifiers, options), function (v, key) {
                  return _config.schemas.conversation + '.' + key;
                }))
                // .andWhere( `${schemas.inboxConversation}.inbox_id`, this.inbox.data.id )
                .groupBy(_config.schemas.conversation + '.id').orderByRaw('(resolvedAt IS NOT NULL)').orderByRaw('latestMessageId DESC').orderByRaw('GREATEST( ' + _config.schemas.conversation + '.created_at, ' + _config.schemas.conversation + '.updated_at ) DESC');
                row = void 0;

                if (!this.userUid) {
                  _context3.next = 11;
                  break;
                }

                _context3.next = 8;
                return (0, _bluebird.resolve)(request.column(_mapper2.default.listFields(_inboxUserFieldsMap2.default, 'select', 'db', options, true, 'inboxUser.').map(function (v) {
                  return _config.schemas.inboxUser + '.' + v;
                })).leftJoin(_config.schemas.inboxUser, function (join) {
                  return join.on(_config.schemas.inboxUser + '.inbox_id', _config.schemas.inboxConversation + '.inbox_id').onNull(_config.schemas.inboxUser + '.left_at');
                }).where(_config.schemas.inboxUser + '.user_uid', this.userUid));

              case 8:
                row = _context3.sent;
                _context3.next = 14;
                break;

              case 11:
                _context3.next = 13;
                return (0, _bluebird.resolve)(request.where(_config.schemas.inboxConversation + '.inbox_id', this.inbox.data.id));

              case 13:
                row = _context3.sent;

              case 14:
                if (row) {
                  _context3.next = 17;
                  break;
                }

                this.data = null;
                return _context3.abrupt('return', this);

              case 17:
                result = _lodash2.default.reduce((0, _extends3.default)({}, row, _mapper2.default.toObj(_conversationFieldsMap2.default, row, options)), function (result, value, key) {
                  return _lodash2.default.set(result, key, value);
                }, {});
                _context3.next = 20;
                return (0, _bluebird.resolve)((0, _populateLatestMessage2.default)(result, this.inbox));

              case 20:
                result = _context3.sent;
                _context3.next = 23;
                return (0, _bluebird.resolve)((0, _populateParticipants2.default)(result));

              case 23:
                result = _context3.sent;

                if (result.resolvedAt) {
                  _context3.next = 30;
                  break;
                }

                _context3.next = 27;
                return (0, _bluebird.resolve)(this.getAvailableActions(result));

              case 27:
                result.actions = _context3.sent;
                _context3.next = 31;
                break;

              case 30:
                result.actions = [];

              case 31:

                this.data = result;

                return _context3.abrupt('return', this);

              case 33:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function get(_x4) {
        return _ref5.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: 'update',
    value: function () {
      var _ref6 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(data, options) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return (0, _bluebird.resolve)(this._loadConversation());

              case 2:

                if (data.resolvedAt) {
                  data.resolvedAt = new Date(data.resolvedAt);
                }

                (0, _validate2.default)(ajv, _conversationSchemas.updateSchema, data);

                data = (0, _extends3.default)({}, _lodash2.default.omit(data, 'params'), {
                  store: (0, _extends3.default)({}, this.data.store, {
                    params: data.params || {}
                  })
                });

                _context4.next = 7;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.conversation).update((0, _extends3.default)({}, _mapper2.default.toDb(_conversationFieldsMap2.default, 'update', data, options), {
                  updated_at: new Date()
                })).leftJoin(_config.schemas.inboxConversation, _config.schemas.conversation + '.id', _config.schemas.inboxConversation + '.conversation_id').where(_lodash2.default.mapKeys(_mapper2.default.toDb(_conversationFieldsMap2.default, 'select', this.identifiers, options), function (v, key) {
                  return _config.schemas.conversation + '.' + key;
                })));

              case 7:
                return _context4.abrupt('return', this.get());

              case 8:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function update(_x5, _x6) {
        return _ref6.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: 'action',
    value: function () {
      var _ref7 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(code, inboxUser) {
        var _inboxUser, actions, action, data;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return (0, _bluebird.resolve)(this._loadConversation());

              case 2:
                _context5.next = 4;
                return (0, _bluebird.resolve)(this._getInboxUser(this.userUid ? { userUid: this.userUid } : inboxUser, { inbox: this.inbox }));

              case 4:
                _inboxUser = _context5.sent;

                if (_inboxUser.data) {
                  _context5.next = 7;
                  break;
                }

                throw new _verror2.default('Inbox user %j not found', _inboxUser.identifiers);

              case 7:
                _context5.next = 9;
                return (0, _bluebird.resolve)(this.getAvailableActions(this.data));

              case 9:
                actions = _context5.sent;
                action = actions.find(function (v) {
                  return v && v.code === code;
                });

                if (action) {
                  _context5.next = 13;
                  break;
                }

                throw new _verror2.default('This action (%s) doesn\'t exist for a conversation of type %s (%j)', code, this.data.type, this.identifiers);

              case 13:
                data = {
                  store: (0, _extends3.default)({}, this.data.store, {
                    resolvedWith: code,
                    resolvedBy: {
                      inboxUserId: _inboxUser.data.id,
                      userUid: _inboxUser.data.userUid
                    }
                  })
                };
                _context5.next = 16;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.conversation).update((0, _extends3.default)({}, _mapper2.default.toDb(_conversationFieldsMap2.default, 'update', data, { protected: false }), {
                  updated_at: new Date(),
                  resolved_at: new Date()
                })).leftJoin(_config.schemas.inboxConversation, _config.schemas.conversation + '.id', _config.schemas.inboxConversation + '.conversation_id').where(_lodash2.default.mapKeys(_mapper2.default.toDb(_conversationFieldsMap2.default, 'select', this.identifiers), function (v, key) {
                  return _config.schemas.conversation + '.' + key;
                })));

              case 16:
                _context5.prev = 16;
                _context5.next = 19;
                return (0, _bluebird.resolve)(_config.interfaces.onAction(this.data, action));

              case 19:
                _context5.next = 24;
                break;

              case 21:
                _context5.prev = 21;
                _context5.t0 = _context5['catch'](16);

                log.error(new _verror2.default({
                  cause: _context5.t0,
                  info: { conversation: this, code: code }
                }, 'Error in onAction interface'));

              case 24:
                return _context5.abrupt('return', this.get());

              case 25:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[16, 21]]);
      }));

      function action(_x7, _x8) {
        return _ref7.apply(this, arguments);
      }

      return action;
    }()
  }, {
    key: '_loadInbox',
    value: function () {
      var _ref8 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (this.inbox.data) {
                  _context6.next = 3;
                  break;
                }

                _context6.next = 3;
                return (0, _bluebird.resolve)(this.inbox.get());

              case 3:
                if (this.inbox.data) {
                  _context6.next = 5;
                  break;
                }

                throw new _verror2.default('Inbox %j not found', this.inbox.identifiers);

              case 5:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _loadInbox() {
        return _ref8.apply(this, arguments);
      }

      return _loadInbox;
    }()
  }, {
    key: '_loadConversation',
    value: function () {
      var _ref9 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (this.data) {
                  _context7.next = 3;
                  break;
                }

                _context7.next = 3;
                return (0, _bluebird.resolve)(this.get());

              case 3:
                if (this.data) {
                  _context7.next = 5;
                  break;
                }

                throw new _verror2.default('Conversation %j not found', this.identifiers);

              case 5:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function _loadConversation() {
        return _ref9.apply(this, arguments);
      }

      return _loadConversation;
    }()
  }, {
    key: '_getInboxUser',
    value: function () {
      var _ref10 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(identifiers) {
        var _ref11 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            inbox = _ref11.inbox,
            _ref11$createOnNull = _ref11.createOnNull,
            createOnNull = _ref11$createOnNull === undefined ? false : _ref11$createOnNull;

        var inboxUser;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return (0, _bluebird.resolve)(new _InboxUser2.default(identifiers, { inbox: inbox }).get({ createOnNull: createOnNull }));

              case 2:
                inboxUser = _context8.sent;

                if (inboxUser.data) {
                  _context8.next = 5;
                  break;
                }

                throw new _verror2.default('InboxUser %j not found in Inbox %j', identifiers, this.inbox.identifiers);

              case 5:
                return _context8.abrupt('return', inboxUser);

              case 6:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function _getInboxUser(_x9, _x10) {
        return _ref10.apply(this, arguments);
      }

      return _getInboxUser;
    }()
  }, {
    key: 'getAvailableActions',
    value: function () {
      var _ref12 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(conversation) {
        var _this2 = this;

        var actions, inbox;
        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                actions = _lodash2.default.get(_config.types, [conversation.type, 'actions'], []);

                if (!(this.inbox.data.id === conversation.inboxContextId)) {
                  _context10.next = 5;
                  break;
                }

                _context10.t0 = this.inbox;
                _context10.next = 8;
                break;

              case 5:
                _context10.next = 7;
                return (0, _bluebird.resolve)(new _Inbox2.default(conversation.inboxContextId).get());

              case 7:
                _context10.t0 = _context10.sent;

              case 8:
                inbox = _context10.t0;
                return _context10.abrupt('return', actions.reduce(function () {
                  var _ref13 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(result, action) {
                    var keep;
                    return _regenerator2.default.wrap(function _callee9$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            _context9.next = 2;
                            return (0, _bluebird.resolve)(_config.interfaces.filterAction(inbox.data, conversation, action));

                          case 2:
                            keep = _context9.sent;

                            if (keep) {
                              _context9.next = 5;
                              break;
                            }

                            return _context9.abrupt('return', result);

                          case 5:
                            _context9.t0 = [];
                            _context9.t1 = _toConsumableArray3.default;
                            _context9.next = 9;
                            return (0, _bluebird.resolve)(result);

                          case 9:
                            _context9.t2 = _context9.sent;
                            _context9.t3 = (0, _context9.t1)(_context9.t2);
                            _context9.t4 = [action];
                            return _context9.abrupt('return', _context9.t0.concat.call(_context9.t0, _context9.t3, _context9.t4));

                          case 13:
                          case 'end':
                            return _context9.stop();
                        }
                      }
                    }, _callee9, _this2);
                  }));

                  return function (_x13, _x14) {
                    return _ref13.apply(this, arguments);
                  };
                }(), []));

              case 11:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function getAvailableActions(_x12) {
        return _ref12.apply(this, arguments);
      }

      return getAvailableActions;
    }()
  }, {
    key: 'toJSON',
    value: function toJSON() {
      if (!this.data) {
        return null;
      }

      return this.data;
    }
  }]);
  return Conversation;
}();

exports.default = Conversation;
module.exports = exports['default'];
//# sourceMappingURL=Conversation.js.map