'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _bluebird = require('bluebird');

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _ajv = require('ajv');

var _ajv2 = _interopRequireDefault(_ajv);

var _ajvErrors = require('ajv-errors');

var _ajvErrors2 = _interopRequireDefault(_ajvErrors);

var _ajvKeywords = require('ajv-keywords');

var _ajvKeywords2 = _interopRequireDefault(_ajvKeywords);

var _parseListArguments2 = require('@openagenda/service-utils/parseListArguments');

var _parseListArguments3 = _interopRequireDefault(_parseListArguments2);

var _Conversation = require('./Conversation');

var _Conversation2 = _interopRequireDefault(_Conversation);

var _mapper = require('./utils/mapper');

var _mapper2 = _interopRequireDefault(_mapper);

var _validate = require('./utils/validate');

var _validate2 = _interopRequireDefault(_validate);

var _conversationFieldsMap = require('./db/conversationFieldsMap');

var _conversationFieldsMap2 = _interopRequireDefault(_conversationFieldsMap);

var _inboxUserFieldsMap = require('./db/inboxUserFieldsMap');

var _inboxUserFieldsMap2 = _interopRequireDefault(_inboxUserFieldsMap);

var _populateParticipants = require('./db/populateParticipants');

var _populateParticipants2 = _interopRequireDefault(_populateParticipants);

var _populateLatestMessage = require('./db/populateLatestMessage');

var _populateLatestMessage2 = _interopRequireDefault(_populateLatestMessage);

var _conversationSchemas = require('./validators/conversationSchemas');

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ajv = new _ajv2.default({ allErrors: true, jsonPointers: true, errorDataPath: 'property' });
(0, _ajvErrors2.default)(ajv);
(0, _ajvKeywords2.default)(ajv, ['instanceof']);

var Conversations = function () {
  function Conversations(options) {
    (0, _classCallCheck3.default)(this, Conversations);

    this.inbox = options.inbox;
    this.userUid = options.userUid; // define if it's in context of a user or not
  }

  (0, _createClass3.default)(Conversations, [{
    key: 'create',
    value: function create(data, options) {
      return new _Conversation2.default(null, { inbox: this.inbox, userUid: this.userUid }).create(data, options);
    }
  }, {
    key: 'get',
    value: function get(identifiers, options) {
      return new _Conversation2.default(identifiers, { inbox: this.inbox, userUid: this.userUid }).get(options);
    }
  }, {
    key: 'update',
    value: function update(identifiers, data, options) {
      return new _Conversation2.default(identifiers, { inbox: this.inbox, userUid: this.userUid }).update(data, options);
    }
  }, {
    key: 'action',
    value: function action(identifiers, code, inboxUser) {
      return new _Conversation2.default(identifiers, { inbox: this.inbox, userUid: this.userUid }).action(code, inboxUser);
    }
  }, {
    key: 'list',
    value: function () {
      var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var _parseListArguments,
            query,
            offset,
            limit,
            options,
            rows,
            request,
            result,
            _args = arguments;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _bluebird.resolve)(this._loadInbox());

              case 2:
                _parseListArguments = _parseListArguments3.default.apply(undefined, _args), query = _parseListArguments.query, offset = _parseListArguments.offset, limit = _parseListArguments.limit, options = _parseListArguments.options;


                (0, _validate2.default)(ajv, _conversationSchemas.listSchema, query);

                rows = void 0;
                request = (0, _config.knex)(_config.schemas.conversation).select().column(_mapper2.default.listFields(_conversationFieldsMap2.default, 'select', 'db', options, true).map(function (v) {
                  return _config.schemas.conversation + '.' + v;
                })).column(_config.schemas.inbox + '.id as inboxContextId').max(_config.schemas.message + '.id as latestMessageId').leftJoin(_config.schemas.inboxConversation, _config.schemas.inboxConversation + '.conversation_id', _config.schemas.conversation + '.id').leftJoin(_config.schemas.inbox, _config.schemas.inbox + '.id', _config.schemas.inboxConversation + '.inbox_id').leftJoin(_config.schemas.message, _config.schemas.message + '.conversation_id', _config.schemas.conversation + '.id').where(_lodash2.default.mapKeys(_mapper2.default.toDb(_conversationFieldsMap2.default, 'select', query, options), function (v, key) {
                  return _config.schemas.conversation + '.' + key;
                })).groupBy(_config.schemas.conversation + '.id').orderByRaw('(resolvedAt IS NOT NULL)').orderByRaw('latestMessageId DESC').orderByRaw('GREATEST( ' + _config.schemas.conversation + '.created_at, ' + _config.schemas.conversation + '.updated_at ) DESC').offset(offset).limit(limit);

                if (!this.userUid) {
                  _context.next = 12;
                  break;
                }

                _context.next = 9;
                return (0, _bluebird.resolve)(request.column(_mapper2.default.listFields(_inboxUserFieldsMap2.default, 'select', 'db', options, true, 'inboxUser.').map(function (v) {
                  return _config.schemas.inboxUser + '.' + v;
                })).leftJoin(_config.schemas.inboxUser, function (join) {
                  return join.on(_config.schemas.inboxUser + '.inbox_id', _config.schemas.inboxConversation + '.inbox_id').onNull(_config.schemas.inboxUser + '.left_at');
                }).where(_config.schemas.inboxUser + '.user_uid', this.userUid));

              case 9:
                rows = _context.sent;
                _context.next = 15;
                break;

              case 12:
                _context.next = 14;
                return (0, _bluebird.resolve)(request.where(_config.schemas.inboxConversation + '.inbox_id', this.inbox.data.id));

              case 14:
                rows = _context.sent;

              case 15:
                result = rows.map(function (row) {
                  return _lodash2.default.reduce((0, _extends3.default)({}, row, _mapper2.default.toObj(_conversationFieldsMap2.default, row, options)), function (r, value, key) {
                    return _lodash2.default.set(r, key, value);
                  }, {});
                });
                _context.next = 18;
                return (0, _bluebird.resolve)((0, _populateLatestMessage2.default)(result, this.inbox));

              case 18:
                result = _context.sent;
                _context.next = 21;
                return (0, _bluebird.resolve)((0, _populateParticipants2.default)(result));

              case 21:
                result = _context.sent;


                this.data = result;

                return _context.abrupt('return', this);

              case 24:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function list(_x) {
        return _ref.apply(this, arguments);
      }

      return list;
    }()
  }, {
    key: '_loadInbox',
    value: function () {
      var _ref2 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.inbox.data) {
                  _context2.next = 3;
                  break;
                }

                _context2.next = 3;
                return (0, _bluebird.resolve)(this.inbox.get());

              case 3:
                if (this.inbox.data) {
                  _context2.next = 5;
                  break;
                }

                throw new VError('Inbox %j not found', this.inbox.identifiers);

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _loadInbox() {
        return _ref2.apply(this, arguments);
      }

      return _loadInbox;
    }()
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.data || null;
    }
  }]);
  return Conversations;
}();

exports.default = Conversations;
module.exports = exports['default'];
//# sourceMappingURL=Conversations.js.map