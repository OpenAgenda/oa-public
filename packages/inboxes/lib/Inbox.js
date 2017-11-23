'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

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

var _verror = require('verror');

var _verror2 = _interopRequireDefault(_verror);

var _config = require('./config');

var _mapper = require('./utils/mapper');

var _mapper2 = _interopRequireDefault(_mapper);

var _inboxFieldsMap = require('./db/inboxFieldsMap');

var _inboxFieldsMap2 = _interopRequireDefault(_inboxFieldsMap);

var _validate = require('./utils/validate');

var _validate2 = _interopRequireDefault(_validate);

var _inboxSchemas = require('./validators/inboxSchemas');

var _InboxUsers = require('./InboxUsers');

var _InboxUsers2 = _interopRequireDefault(_InboxUsers);

var _Conversations = require('./Conversations');

var _Conversations2 = _interopRequireDefault(_Conversations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ajv = new _ajv2.default({ allErrors: true, jsonPointers: true, errorDataPath: 'property' });
(0, _ajvErrors2.default)(ajv);

var Inbox = function () {
  function Inbox(identifiers) {
    (0, _classCallCheck3.default)(this, Inbox);

    if (typeof identifiers === 'number') {
      identifiers = { id: identifiers };
    }

    this.identifiers = identifiers;
    this.users = new _InboxUsers2.default({ inbox: this });
    this.conversations = new _Conversations2.default({ inbox: this });
  }

  (0, _createClass3.default)(Inbox, [{
    key: 'create',
    value: function () {
      var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data, options) {
        var inbox, _ref2, _ref3, insertedId;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                (0, _validate2.default)(ajv, _inboxSchemas.createSchema, data);

                _context.next = 3;
                return (0, _bluebird.resolve)(new Inbox(data)._get(options));

              case 3:
                inbox = _context.sent;

                if (!inbox.data) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt('return', inbox);

              case 6:
                _context.next = 8;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inbox).insert(_mapper2.default.toDb(_inboxFieldsMap2.default, 'insert', data, { protected: false })));

              case 8:
                _ref2 = _context.sent;
                _ref3 = (0, _slicedToArray3.default)(_ref2, 1);
                insertedId = _ref3[0];


                this.identifiers = { id: insertedId };

                return _context.abrupt('return', this.get(options));

              case 13:
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
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _bluebird.resolve)(this._get(options));

              case 2:
                if (!(!this.data && this.identifiers.type)) {
                  _context2.next = 4;
                  break;
                }

                return _context2.abrupt('return', this.create(this.identifiers, options));

              case 4:
                return _context2.abrupt('return', this);

              case 5:
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
    key: 'remove',
    value: function () {
      var _ref5 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (0, _bluebird.resolve)(this.get());

              case 2:
                if (this.data) {
                  _context3.next = 4;
                  break;
                }

                throw new _verror2.default('You can not remove a inbox that does not exists: %j', this.identifiers);

              case 4:
                _context3.next = 6;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inbox).where('id', this.data.id));

              case 6:

                this.data = null;

                return _context3.abrupt('return', this);

              case 8:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function remove() {
        return _ref5.apply(this, arguments);
      }

      return remove;
    }()
  }, {
    key: '_get',
    value: function () {
      var _ref6 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(options) {
        var data;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                (0, _validate2.default)(ajv, (0, _inboxSchemas.getIdentifiersSchema)(this.identifiers), this.identifiers);

                _context4.next = 3;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inbox).first(_mapper2.default.listFields(_inboxFieldsMap2.default, 'select', 'db', options)).where(_mapper2.default.toDb(_inboxFieldsMap2.default, 'select', this.identifiers, options)));

              case 3:
                data = _context4.sent;


                this.data = _mapper2.default.toObj(_inboxFieldsMap2.default, data, options);

                return _context4.abrupt('return', this);

              case 6:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _get(_x4) {
        return _ref6.apply(this, arguments);
      }

      return _get;
    }()
  }, {
    key: 'toJSON',
    value: function toJSON() {
      if (!this.data) {
        return null;
      }

      return _lodash2.default.pick(this.data, _mapper2.default.listFields(_inboxFieldsMap2.default, 'select', 'obj'));
    }
  }], [{
    key: 'user',
    value: function user(userUid) {
      return {
        conversations: new _Conversations2.default({
          userUid: userUid,
          inbox: new Inbox({ type: 'user', identifier: userUid })
        })
      };
    }
  }]);
  return Inbox;
}();

exports.default = Inbox;
module.exports = exports['default'];
//# sourceMappingURL=Inbox.js.map