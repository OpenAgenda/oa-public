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

var _parseListArguments2 = require('@openagenda/service-utils/parseListArguments');

var _parseListArguments3 = _interopRequireDefault(_parseListArguments2);

var _InboxUser = require('./InboxUser');

var _InboxUser2 = _interopRequireDefault(_InboxUser);

var _mapper = require('./utils/mapper');

var _mapper2 = _interopRequireDefault(_mapper);

var _inboxUserFieldsMap = require('./db/inboxUserFieldsMap');

var _inboxUserFieldsMap2 = _interopRequireDefault(_inboxUserFieldsMap);

var _config = require('./config');

var _inboxUserSchemas = require('./validators/inboxUserSchemas');

var _validate = require('./utils/validate');

var _validate2 = _interopRequireDefault(_validate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ajv = new _ajv2.default({ allErrors: true, jsonPointers: true, errorDataPath: 'property' });
(0, _ajvErrors2.default)(ajv);

var InboxUsers = function () {
  function InboxUsers(options) {
    (0, _classCallCheck3.default)(this, InboxUsers);

    this.inbox = options && options.inbox;
  }

  (0, _createClass3.default)(InboxUsers, [{
    key: 'add',
    value: function add(data, options) {
      return new _InboxUser2.default(null, { inbox: this.inbox }).create(data, options);
    }
  }, {
    key: 'get',
    value: function get(identifiers, options) {
      return new _InboxUser2.default(identifiers, { inbox: this.inbox }).get(options);
    }
  }, {
    key: 'remove',
    value: function remove(identifiers) {
      return new _InboxUser2.default(identifiers, { inbox: this.inbox }).remove();
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
            data,
            request,
            rows,
            result,
            _args = arguments;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.inbox) {
                  _context.next = 3;
                  break;
                }

                _context.next = 3;
                return (0, _bluebird.resolve)(this._loadInbox());

              case 3:
                _parseListArguments = _parseListArguments3.default.apply(undefined, _args), query = _parseListArguments.query, offset = _parseListArguments.offset, limit = _parseListArguments.limit, options = _parseListArguments.options;
                data = _lodash2.default.omit(query, ['leftAt']);


                if (this.inbox && this.inbox.data) {
                  data.inboxId = this.inbox.data.id;
                }

                (0, _validate2.default)(ajv, (0, _inboxUserSchemas.getListSchema)(data), data);

                request = (0, _config.knex)(_config.schemas.inboxUser).select().column(_mapper2.default.listFields(_inboxUserFieldsMap2.default, 'select', 'db', options, true).map(function (v) {
                  return _config.schemas.inboxUser + '.' + v;
                })).where(_lodash2.default.mapKeys(_mapper2.default.toDb(_inboxUserFieldsMap2.default, 'select', _lodash2.default.omit(data, 'inboxId'), options), function (v, key) {
                  return _config.schemas.inboxUser + '.' + key;
                })).offset(offset).limit(limit);


                if (data.inboxId) {
                  request.whereIn(_config.schemas.inboxUser + '.inbox_id', [].concat(data.inboxId));
                }

                if (query.leftAt === true) {
                  request.whereNotNull(_config.schemas.inboxUser + '.left_at');
                } else if (query.leftAt === false) {
                  request.whereNull(_config.schemas.inboxUser + '.left_at');
                }

                _context.next = 12;
                return (0, _bluebird.resolve)(request);

              case 12:
                rows = _context.sent;
                result = rows.map(function (row) {
                  return _lodash2.default.reduce((0, _extends3.default)({}, row, _mapper2.default.toObj(_inboxUserFieldsMap2.default, row, options)), function (result, value, key) {
                    return _lodash2.default.set(result, key, value);
                  }, {});
                });


                this.data = result;

                return _context.abrupt('return', this);

              case 16:
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
  return InboxUsers;
}();

exports.default = InboxUsers;
module.exports = exports['default'];
//# sourceMappingURL=InboxUsers.js.map