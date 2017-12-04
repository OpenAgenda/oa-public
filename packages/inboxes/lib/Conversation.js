'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
      var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data, options) {
        var params, inboxUser, destinationInbox, protectedData, _ref2, _ref3, insertedId;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                params = _lodash2.default.merge({
                  createInboxUserOnNull: false
                }, options);
                _context.next = 3;
                return (0, _bluebird.resolve)(this._loadInbox());

              case 3:
                _context.next = 5;
                return (0, _bluebird.resolve)(this._getInboxUser(this.userUid ? { userUid: this.userUid } : data.creatorInboxUser, { inbox: this.inbox, createOnNull: params.createInboxUserOnNull }));

              case 5:
                inboxUser = _context.sent;

                if (inboxUser.data) {
                  _context.next = 8;
                  break;
                }

                throw new _verror2.default('Inbox user %j not found', inboxUser.identifiers);

              case 8:
                _context.next = 10;
                return (0, _bluebird.resolve)(new _Inbox2.default(data.destinationInbox).get());

              case 10:
                destinationInbox = _context.sent;

                if (destinationInbox.data) {
                  _context.next = 13;
                  break;
                }

                throw new _verror2.default('Destination Inbox %j not found', destinationInbox.identifiers);

              case 13:

                (0, _validate2.default)(ajv, _conversationSchemas.createSchema, _lodash2.default.omit(data, 'destinationInbox', 'creatorInboxUser'));

                if (!(!_config.types || !_config.types[data.type])) {
                  _context.next = 16;
                  break;
                }

                throw new _verror2.default('Unknow conversation type %s', data.type);

              case 16:
                protectedData = (0, _extends3.default)({
                  store: { params: data.params || {} }
                }, _lodash2.default.pick(data, 'type', 'typeIdentifier'));


                data = _lodash2.default.omit(data, 'params', 'destinationInbox', 'creatorInboxUser');

                _context.next = 20;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.conversation).insert((0, _extends3.default)({}, _mapper2.default.toDb(_conversationFieldsMap2.default, 'insert', data, options), _mapper2.default.toDb(_conversationFieldsMap2.default, 'insert', protectedData, { protected: false }), {
                  creator_inbox_user_id: inboxUser.data.id
                })));

              case 20:
                _ref2 = _context.sent;
                _ref3 = (0, _slicedToArray3.default)(_ref2, 1);
                insertedId = _ref3[0];


                this.identifiers = { id: insertedId };

                _context.next = 26;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inboxConversation).insert({
                  inbox_id: this.inbox.data.id,
                  conversation_id: this.identifiers.id
                }));

              case 26:
                if (!(this.inbox.data.id !== destinationInbox.data.id)) {
                  _context.next = 29;
                  break;
                }

                _context.next = 29;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inboxConversation).insert({
                  inbox_id: destinationInbox.data.id,
                  conversation_id: this.identifiers.id
                }));

              case 29:
                if (!data.message) {
                  _context.next = 32;
                  break;
                }

                _context.next = 32;
                return (0, _bluebird.resolve)(this.messages.create({
                  body: data.message,
                  userUid: inboxUser.data.userUid
                }));

              case 32:
                return _context.abrupt('return', this.get(options));

              case 33:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function create(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'get',
    value: function () {
      var _ref4 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(options) {
        var row, result, creatorInboxId;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _bluebird.resolve)(this._loadInbox());

              case 2:

                (0, _validate2.default)(ajv, _conversationSchemas.identifiersSchema, this.identifiers);

                _context2.next = 5;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.conversation).first().column(_mapper2.default.listFields(_conversationFieldsMap2.default, 'select', 'db', options, true).map(function (v) {
                  return _config.schemas.conversation + '.' + v;
                })).column(_config.schemas.inbox + '.id as inboxContextId').max(_config.schemas.message + '.id as latestMessageId').leftJoin(_config.schemas.inboxConversation, _config.schemas.conversation + '.id', _config.schemas.inboxConversation + '.conversation_id').leftJoin(_config.schemas.inbox, _config.schemas.inbox + '.id', _config.schemas.inboxConversation + '.inbox_id').leftJoin(_config.schemas.message, _config.schemas.message + '.conversation_id', _config.schemas.conversation + '.id').where(_lodash2.default.mapKeys(_mapper2.default.toDb(_conversationFieldsMap2.default, 'select', this.identifiers, options), function (v, key) {
                  return _config.schemas.conversation + '.' + key;
                })).andWhere(_config.schemas.inboxConversation + '.inbox_id', this.inbox.data.id).groupBy(_config.schemas.conversation + '.id').orderByRaw('(resolvedAt IS NOT NULL)').orderByRaw('latestMessageId DESC').orderByRaw('GREATEST( ' + _config.schemas.conversation + '.created_at, ' + _config.schemas.conversation + '.updated_at ) DESC'));

              case 5:
                row = _context2.sent;

                if (row) {
                  _context2.next = 9;
                  break;
                }

                this.data = null;
                return _context2.abrupt('return', this);

              case 9:
                result = _lodash2.default.reduce((0, _extends3.default)({}, row, _mapper2.default.toObj(_conversationFieldsMap2.default, row, options)), function (result, value, key) {
                  return _lodash2.default.set(result, key, value);
                }, row);
                _context2.next = 12;
                return (0, _bluebird.resolve)((0, _populateLatestMessage2.default)(result, this.inbox));

              case 12:
                result = _context2.sent;
                _context2.next = 15;
                return (0, _bluebird.resolve)((0, _populateParticipants2.default)(result));

              case 15:
                result = _context2.sent;

                if (result.resolvedAt) {
                  _context2.next = 23;
                  break;
                }

                _context2.next = 19;
                return (0, _bluebird.resolve)(this._getInboxUser(result.creatorInboxUserId));

              case 19:
                creatorInboxId = _context2.sent.data.inboxId;


                result.actions = this.getAvailableActions(result, creatorInboxId) || null;
                _context2.next = 24;
                break;

              case 23:
                result.actions = null;

              case 24:

                this.data = result;

                return _context2.abrupt('return', this);

              case 26:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function get(_x3) {
        return _ref4.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: 'update',
    value: function () {
      var _ref5 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(data, options) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
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

                _context3.next = 7;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.conversation).update((0, _extends3.default)({}, _mapper2.default.toDb(_conversationFieldsMap2.default, 'update', data, options), {
                  updated_at: new Date()
                })).leftJoin(_config.schemas.inboxConversation, _config.schemas.conversation + '.id', _config.schemas.inboxConversation + '.conversation_id').where(_lodash2.default.mapKeys(_mapper2.default.toDb(_conversationFieldsMap2.default, 'select', this.identifiers, options), function (v, key) {
                  return _config.schemas.conversation + '.' + key;
                })).andWhere(_config.schemas.inboxConversation + '.inbox_id', this.inbox.data.id));

              case 7:
                return _context3.abrupt('return', this.get());

              case 8:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function update(_x4, _x5) {
        return _ref5.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: 'action',
    value: function () {
      var _ref6 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(code, inboxUser) {
        var _inboxUser, creatorInboxId, actions, action, data;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return (0, _bluebird.resolve)(this._loadConversation());

              case 2:
                _context4.next = 4;
                return (0, _bluebird.resolve)(this._getInboxUser(this.userUid ? { userUid: this.userUid } : inboxUser, { inbox: this.inbox }));

              case 4:
                _inboxUser = _context4.sent;
                _context4.next = 7;
                return (0, _bluebird.resolve)(this._getInboxUser(this.data.creatorInboxUserId));

              case 7:
                creatorInboxId = _context4.sent.data.inboxId;

                if (_inboxUser.data) {
                  _context4.next = 10;
                  break;
                }

                throw new _verror2.default('Inbox user %j not found', _inboxUser.identifiers);

              case 10:
                actions = this.getAvailableActions(this.data, creatorInboxId) || [];
                action = actions.find(function (v) {
                  return v && v.code === code;
                });

                if (action) {
                  _context4.next = 14;
                  break;
                }

                throw new _verror2.default('This action (%s) doesn\'t exist for a conversation of type %s (%j)', code, this.data.type, this.identifiers);

              case 14:
                data = {
                  store: (0, _extends3.default)({}, this.data.store, {
                    resolvedWith: code,
                    resolvedBy: {
                      inboxUserId: _inboxUser.data.id,
                      userUid: _inboxUser.data.userUid
                    }
                  })
                };
                _context4.next = 17;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.conversation).update((0, _extends3.default)({}, _mapper2.default.toDb(_conversationFieldsMap2.default, 'update', data, { protected: false }), {
                  updated_at: new Date(),
                  resolved_at: new Date()
                })).leftJoin(_config.schemas.inboxConversation, _config.schemas.conversation + '.id', _config.schemas.inboxConversation + '.conversation_id').where(_lodash2.default.mapKeys(_mapper2.default.toDb(_conversationFieldsMap2.default, 'select', this.identifiers), function (v, key) {
                  return _config.schemas.conversation + '.' + key;
                })).andWhere(_config.schemas.inboxConversation + '.inbox_id', this.inbox.data.id));

              case 17:
                _context4.prev = 17;
                _context4.next = 20;
                return (0, _bluebird.resolve)(_config.interfaces.onAction(this.data, action));

              case 20:
                _context4.next = 25;
                break;

              case 22:
                _context4.prev = 22;
                _context4.t0 = _context4['catch'](17);

                log.error(new _verror2.default({
                  cause: _context4.t0,
                  info: { conversation: this, code: code }
                }, 'Error in onAction interface'));

              case 25:
                return _context4.abrupt('return', this.get());

              case 26:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[17, 22]]);
      }));

      function action(_x6, _x7) {
        return _ref6.apply(this, arguments);
      }

      return action;
    }()
  }, {
    key: '_loadInbox',
    value: function () {
      var _ref7 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this.inbox.data) {
                  _context5.next = 3;
                  break;
                }

                _context5.next = 3;
                return (0, _bluebird.resolve)(this.inbox.get());

              case 3:
                if (this.inbox.data) {
                  _context5.next = 5;
                  break;
                }

                throw new _verror2.default('Inbox %j not found', this.inbox.identifiers);

              case 5:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _loadInbox() {
        return _ref7.apply(this, arguments);
      }

      return _loadInbox;
    }()
  }, {
    key: '_loadConversation',
    value: function () {
      var _ref8 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (this.data) {
                  _context6.next = 3;
                  break;
                }

                _context6.next = 3;
                return (0, _bluebird.resolve)(this.get());

              case 3:
                if (this.data) {
                  _context6.next = 5;
                  break;
                }

                throw new _verror2.default('Conversation %j not found', this.identifiers);

              case 5:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _loadConversation() {
        return _ref8.apply(this, arguments);
      }

      return _loadConversation;
    }()
  }, {
    key: '_getInboxUser',
    value: function () {
      var _ref9 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(identifiers) {
        var _ref10 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            inbox = _ref10.inbox,
            _ref10$createOnNull = _ref10.createOnNull,
            createOnNull = _ref10$createOnNull === undefined ? false : _ref10$createOnNull;

        var inboxUser;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return (0, _bluebird.resolve)(new _InboxUser2.default(identifiers, { inbox: inbox }).get({ createOnNull: createOnNull }));

              case 2:
                inboxUser = _context7.sent;

                if (inboxUser.data) {
                  _context7.next = 5;
                  break;
                }

                throw new _verror2.default('InboxUser %j not found in Inbox %j', identifiers, this.inbox.identifiers);

              case 5:
                return _context7.abrupt('return', inboxUser);

              case 6:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function _getInboxUser(_x8, _x9) {
        return _ref9.apply(this, arguments);
      }

      return _getInboxUser;
    }()
  }, {
    key: 'getAvailableActions',
    value: function getAvailableActions(conversation, creatorInboxId) {
      var _this = this;

      var fromOrTo = creatorInboxId === this.inbox.data.id ? 'from' : 'to';
      var bothSide = conversation.inboxes.every(function (v) {
        return v.id === _this.inbox.data.id;
      });
      var actions = _lodash2.default.get(_config.types, [conversation.type, 'actions', fromOrTo]);

      if (bothSide) {
        var otherSideActions = _lodash2.default.get(_config.types, [conversation.type, 'actions', fromOrTo === 'from' ? 'to' : 'from']);
        actions = Array.isArray(actions) ? actions.concat(otherSideActions) : otherSideActions;
      }

      return actions;
    }
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