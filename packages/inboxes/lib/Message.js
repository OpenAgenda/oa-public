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

var _config = require('./config');

var _mapper = require('./utils/mapper');

var _mapper2 = _interopRequireDefault(_mapper);

var _messageFieldsMap = require('./db/messageFieldsMap');

var _messageFieldsMap2 = _interopRequireDefault(_messageFieldsMap);

var _inboxUserFieldsMap = require('./db/inboxUserFieldsMap');

var _inboxUserFieldsMap2 = _interopRequireDefault(_inboxUserFieldsMap);

var _inboxFieldsMap = require('./db/inboxFieldsMap');

var _inboxFieldsMap2 = _interopRequireDefault(_inboxFieldsMap);

var _validate = require('./utils/validate');

var _validate2 = _interopRequireDefault(_validate);

var _messageSchemas = require('./validators/messageSchemas');

var _populateDetails = require('./db/populateDetails');

var _populateDetails2 = _interopRequireDefault(_populateDetails);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ajv = new _ajv2.default({ allErrors: true, jsonPointers: true, errorDataPath: 'property' });
(0, _ajvErrors2.default)(ajv);

var Message = function () {
  function Message(identifiers, options) {
    (0, _classCallCheck3.default)(this, Message);

    if (typeof identifiers === 'number') {
      identifiers = { id: identifiers };
    }

    this.identifiers = identifiers;
    this.inbox = options.inbox;
    this.conversation = options.conversation;
    this.userUid = options && options.userUid;
  }

  (0, _createClass3.default)(Message, [{
    key: 'create',
    value: function () {
      var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data, options) {
        var inboxUser, _ref2, _ref3, insertedId;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _bluebird.resolve)(this._loadConversation());

              case 2:
                _context.next = 4;
                return (0, _bluebird.resolve)(this._getInboxUser(data.userUid));

              case 4:
                inboxUser = _context.sent;


                data = (0, _extends3.default)({}, _lodash2.default.pick(data, 'body'), {
                  conversationId: this.conversation.data.id,
                  inboxUserId: inboxUser.data.id
                });

                (0, _validate2.default)(ajv, _messageSchemas.createSchema, data);

                _context.next = 9;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.message).insert(_mapper2.default.toDb(_messageFieldsMap2.default, 'insert', data, { protected: false })));

              case 9:
                _ref2 = _context.sent;
                _ref3 = (0, _slicedToArray3.default)(_ref2, 1);
                insertedId = _ref3[0];


                this.identifiers = { id: insertedId };

                return _context.abrupt('return', this.get(options));

              case 14:
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
        var request, row, result;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _bluebird.resolve)(this._loadConversation());

              case 2:

                if (!options || !options.latest) {
                  (0, _validate2.default)(ajv, _messageSchemas.identifiersSchema, this.identifiers);
                }

                request = (0, _config.knex)(_config.schemas.message).first().column(_mapper2.default.listFields(_messageFieldsMap2.default, 'select', 'db', options, true).map(function (v) {
                  return _config.schemas.message + '.' + v;
                })).column(_mapper2.default.listFields(_inboxUserFieldsMap2.default, 'select', 'db', options, true, 'inboxUser.').map(function (v) {
                  return _config.schemas.inboxUser + '.' + v;
                })).column(_mapper2.default.listFields(_inboxFieldsMap2.default, 'select', 'db', options, true, 'inbox.').map(function (v) {
                  return _config.schemas.inbox + '.' + v;
                })).leftJoin(_config.schemas.inboxUser, _config.schemas.inboxUser + '.id', _config.schemas.message + '.inbox_user_id').leftJoin(_config.schemas.inbox, _config.schemas.inbox + '.id', _config.schemas.inboxUser + '.inbox_id').where(_lodash2.default.mapKeys(_mapper2.default.toDb(_messageFieldsMap2.default, 'select', this.identifiers, options), function (v, key) {
                  return _config.schemas.message + '.' + key;
                }));


                if (options && options.latest) {
                  request.where(_config.schemas.message + '.conversation_id', this.conversation.data.id).orderBy('created_at', 'desc');
                }

                _context2.next = 7;
                return (0, _bluebird.resolve)(request);

              case 7:
                row = _context2.sent;
                result = _lodash2.default.reduce((0, _extends3.default)({}, row, _mapper2.default.toObj(_messageFieldsMap2.default, row, options)), function (result, value, key) {
                  return _lodash2.default.set(result, key, value);
                }, row ? {} : null);
                _context2.next = 11;
                return (0, _bluebird.resolve)((0, _populateDetails2.default)(result, this.inbox));

              case 11:
                this.data = _context2.sent;
                return _context2.abrupt('return', this);

              case 13:
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
    key: '_loadConversation',
    value: function () {
      var _ref5 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.conversation.data) {
                  _context3.next = 3;
                  break;
                }

                _context3.next = 3;
                return (0, _bluebird.resolve)(this.conversation.get());

              case 3:
                if (this.conversation.data) {
                  _context3.next = 5;
                  break;
                }

                throw new _verror2.default('Conversation %j not found', this.inbox.identifiers);

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _loadConversation() {
        return _ref5.apply(this, arguments);
      }

      return _loadConversation;
    }()
  }, {
    key: '_getInboxUser',
    value: function () {
      var _ref6 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(userUid) {
        var identifiers, inboxUser;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                identifiers = { userUid: this.userUid || userUid };
                _context4.next = 3;
                return (0, _bluebird.resolve)(this.inbox.users.get(identifiers));

              case 3:
                inboxUser = _context4.sent;

                if (inboxUser.data) {
                  _context4.next = 6;
                  break;
                }

                throw new _verror2.default('InboxUser %j not found in Inbox %j', identifiers, this.inbox.identifiers);

              case 6:
                return _context4.abrupt('return', inboxUser);

              case 7:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _getInboxUser(_x4) {
        return _ref6.apply(this, arguments);
      }

      return _getInboxUser;
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
  return Message;
}();

exports.default = Message;
module.exports = exports['default'];
//# sourceMappingURL=Message.js.map