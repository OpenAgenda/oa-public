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

var _verror = require('verror');

var _verror2 = _interopRequireDefault(_verror);

var _parseListArguments2 = require('@openagenda/service-utils/parseListArguments');

var _parseListArguments3 = _interopRequireDefault(_parseListArguments2);

var _Message = require('./Message');

var _Message2 = _interopRequireDefault(_Message);

var _config = require('./config');

var _mapper = require('./utils/mapper');

var _mapper2 = _interopRequireDefault(_mapper);

var _messageFieldsMap = require('./db/messageFieldsMap');

var _messageFieldsMap2 = _interopRequireDefault(_messageFieldsMap);

var _inboxUserFieldsMap = require('./db/inboxUserFieldsMap');

var _inboxUserFieldsMap2 = _interopRequireDefault(_inboxUserFieldsMap);

var _inboxFieldsMap = require('./db/inboxFieldsMap');

var _inboxFieldsMap2 = _interopRequireDefault(_inboxFieldsMap);

var _populateDetails = require('./db/populateDetails');

var _populateDetails2 = _interopRequireDefault(_populateDetails);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Messages = function () {
  function Messages(options) {
    (0, _classCallCheck3.default)(this, Messages);

    this.inbox = options.inbox;
    this.userUid = options.userUid; // define if it's in context of a user or not
    this.conversation = options.conversation;
  }

  (0, _createClass3.default)(Messages, [{
    key: 'create',
    value: function create(data, options) {
      return new _Message2.default(null, { inbox: this.inbox, conversation: this.conversation, userUid: this.userUid }).create(data, options);
    }
  }, {
    key: 'get',
    value: function get(identifiers, options) {
      return new _Message2.default(identifiers, { inbox: this.inbox, conversation: this.conversation, userUid: this.userUid }).get(options);
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
                _parseListArguments = _parseListArguments3.default.apply(undefined, _args), query = _parseListArguments.query, offset = _parseListArguments.offset, limit = _parseListArguments.limit, options = _parseListArguments.options;

                if (!(!query || !query.id)) {
                  _context.next = 4;
                  break;
                }

                _context.next = 4;
                return (0, _bluebird.resolve)(this._loadConversation());

              case 4:
                rows = void 0;
                request = (0, _config.knex)(_config.schemas.message).select().column(_mapper2.default.listFields(_messageFieldsMap2.default, 'select', 'db', options, true).map(function (v) {
                  return _config.schemas.message + '.' + v;
                })).column(_mapper2.default.listFields(_inboxUserFieldsMap2.default, 'select', 'db', options, true, 'inboxUser.').map(function (v) {
                  return _config.schemas.inboxUser + '.' + v;
                })).column(_mapper2.default.listFields(_inboxFieldsMap2.default, 'select', 'db', options, true, 'inbox.').map(function (v) {
                  return _config.schemas.inbox + '.' + v;
                })).leftJoin(_config.schemas.inboxUser, _config.schemas.inboxUser + '.id', _config.schemas.message + '.inbox_user_id').leftJoin(_config.schemas.inbox, _config.schemas.inbox + '.id', _config.schemas.inboxUser + '.inbox_id').orderBy('created_at', 'desc').offset(offset).limit(limit);

                if (!(query && query.id)) {
                  _context.next = 12;
                  break;
                }

                _context.next = 9;
                return (0, _bluebird.resolve)(request.whereIn(_config.schemas.message + '.id', [].concat(query.id)));

              case 9:
                rows = _context.sent;
                _context.next = 15;
                break;

              case 12:
                _context.next = 14;
                return (0, _bluebird.resolve)(request.where('conversation_id', this.conversation.data.id));

              case 14:
                rows = _context.sent;

              case 15:
                result = rows.map(function (row) {
                  return _lodash2.default.reduce((0, _extends3.default)({}, row, _mapper2.default.toObj(_messageFieldsMap2.default, row, options)), function (result, value, key) {
                    return _lodash2.default.set(result, key, value);
                  }, {});
                });
                _context.next = 18;
                return (0, _bluebird.resolve)((0, _populateDetails2.default)(result, this.inbox));

              case 18:
                this.data = _context.sent;
                return _context.abrupt('return', this);

              case 20:
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
    key: '_loadConversation',
    value: function () {
      var _ref2 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.conversation.data) {
                  _context2.next = 3;
                  break;
                }

                _context2.next = 3;
                return (0, _bluebird.resolve)(this.conversation.get());

              case 3:
                if (this.conversation.data) {
                  _context2.next = 5;
                  break;
                }

                throw new _verror2.default('Conversation %j not found', this.inbox.identifiers);

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _loadConversation() {
        return _ref2.apply(this, arguments);
      }

      return _loadConversation;
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
  return Messages;
}();

exports.default = Messages;
module.exports = exports['default'];
//# sourceMappingURL=Messages.js.map