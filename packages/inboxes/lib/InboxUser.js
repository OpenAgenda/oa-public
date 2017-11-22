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

var _inboxUserFieldsMap = require('./db/inboxUserFieldsMap');

var _inboxUserFieldsMap2 = _interopRequireDefault(_inboxUserFieldsMap);

var _validate = require('./utils/validate');

var _validate2 = _interopRequireDefault(_validate);

var _inboxUserSchemas = require('./validators/inboxUserSchemas');

var _populateDetails = require('./db/populateDetails');

var _populateDetails2 = _interopRequireDefault(_populateDetails);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ajv = new _ajv2.default({ allErrors: true, jsonPointers: true, errorDataPath: 'property' });
(0, _ajvErrors2.default)(ajv);

var InboxUser = function () {
  function InboxUser(identifiers, options) {
    (0, _classCallCheck3.default)(this, InboxUser);

    if (typeof identifiers === 'number') {
      identifiers = { id: identifiers };
    }

    this.identifiers = identifiers;
    this.inbox = options && options.inbox;
  }

  (0, _createClass3.default)(InboxUser, [{
    key: 'create',
    value: function () {
      var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data, options) {
        var inboxUser, _ref2, _ref3, insertedId;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _bluebird.resolve)(this._loadInbox());

              case 2:

                data = (0, _extends3.default)({}, data, {
                  inboxId: this.inbox.data.id
                });

                (0, _validate2.default)(ajv, _inboxUserSchemas.createSchema, data);

                _context.next = 6;
                return (0, _bluebird.resolve)(new InboxUser(data, { inbox: this.inbox }).get(options));

              case 6:
                inboxUser = _context.sent;

                if (!inboxUser.data) {
                  _context.next = 9;
                  break;
                }

                return _context.abrupt('return', inboxUser);

              case 9:
                _context.next = 11;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inboxUser).insert(_mapper2.default.toDb(_inboxUserFieldsMap2.default, 'insert', data, { protected: false })));

              case 11:
                _ref2 = _context.sent;
                _ref3 = (0, _slicedToArray3.default)(_ref2, 1);
                insertedId = _ref3[0];


                this.identifiers = { id: insertedId };

                return _context.abrupt('return', this.get(options));

              case 16:
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
        var params, data, row, result;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                params = _lodash2.default.merge({
                  detailed: false,
                  createOnNull: false
                }, options);

                if (!this.inbox) {
                  _context2.next = 4;
                  break;
                }

                _context2.next = 4;
                return (0, _bluebird.resolve)(this._loadInbox());

              case 4:
                data = (0, _extends3.default)({}, this.identifiers);


                if (!this.identifiers.id && this.inbox && this.inbox.data) {
                  data.inboxId = this.inbox.data.id;
                }

                (0, _validate2.default)(ajv, (0, _inboxUserSchemas.getIdentifiersSchema)(this.identifiers, this.inbox), data);

                _context2.next = 9;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inboxUser).first(_mapper2.default.listFields(_inboxUserFieldsMap2.default, 'select', 'db', params)).where(_mapper2.default.toDb(_inboxUserFieldsMap2.default, 'select', data, params)));

              case 9:
                row = _context2.sent;
                result = _mapper2.default.toObj(_inboxUserFieldsMap2.default, row, params);

                if (!(!result && params.createOnNull)) {
                  _context2.next = 13;
                  break;
                }

                return _context2.abrupt('return', this.create(this.identifiers));

              case 13:
                if (!(params.detailed && result)) {
                  _context2.next = 18;
                  break;
                }

                _context2.next = 16;
                return (0, _bluebird.resolve)((0, _populateDetails2.default)({
                  inboxUser: result,
                  inboxUserId: result.id
                }, this.inbox));

              case 16:
                _context2.next = 19;
                break;

              case 18:
                void 0;

              case 19:
                this.data = result;
                return _context2.abrupt('return', this);

              case 21:
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
        var leftAt;
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

                throw new _verror2.default('You can not remove a user inbox that does not exists: %j', this.identifiers);

              case 4:
                leftAt = new Date();
                _context3.next = 7;
                return (0, _bluebird.resolve)((0, _config.knex)(_config.schemas.inboxUser).update('left_at', leftAt).where('id', this.data.id));

              case 7:

                this.data.leftAt = leftAt;

                return _context3.abrupt('return', this);

              case 9:
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
    key: '_loadInbox',
    value: function () {
      var _ref6 = (0, _bluebird.coroutine)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this.inbox.data) {
                  _context4.next = 3;
                  break;
                }

                _context4.next = 3;
                return (0, _bluebird.resolve)(this.inbox.get());

              case 3:
                if (this.inbox.data) {
                  _context4.next = 5;
                  break;
                }

                throw new _verror2.default('Inbox %j not found', this.inbox.identifiers);

              case 5:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _loadInbox() {
        return _ref6.apply(this, arguments);
      }

      return _loadInbox;
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
  return InboxUser;
}();

exports.default = InboxUser;
module.exports = exports['default'];
//# sourceMappingURL=InboxUser.js.map