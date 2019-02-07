"use strict";

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var get = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(uidOrRequest) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (_.isObject(uidOrRequest) && uidOrRequest.cookies) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', _getFromUid(uidOrRequest, options));

          case 2:
            return _context.abrupt('return', _getFromRequest(uidOrRequest, options));

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function get(_x2) {
    return _ref.apply(this, arguments);
  };
}();

var _getFromRequest = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(request) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var cookieUser, stored;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            cookieUser = cleanSession(request.session).user;

            if (cookieUser) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt('return', null);

          case 3:
            _context2.next = 5;
            return _getFromUid(cookieUser.uid, options);

          case 5:
            stored = _context2.sent;

            if (stored) {
              _context2.next = 8;
              break;
            }

            return _context2.abrupt('return', null);

          case 8:
            return _context2.abrupt('return', _.extend(cookieUser, stored));

          case 9:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function _getFromRequest(_x4) {
    return _ref2.apply(this, arguments);
  };
}();

var _getFromUid = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(uid) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var result;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return redisCommand('get', [config.redis.prefix, uid].join(':'));

          case 2:
            result = _context3.sent;

            if (result) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt('return', null);

          case 5:
            _context3.prev = 5;
            return _context3.abrupt('return', JSON.parse(result));

          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3['catch'](5);


            log('error', 'could not parse store for user %s: %s', uid, result);

            return _context3.abrupt('return', null);

          case 13:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[5, 9]]);
  }));

  return function _getFromUid(_x6) {
    return _ref3.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require('./config');

var _require = require('./helpers'),
    cleanSession = _require.cleanSession,
    callbackify = _require.callbackify,
    redisCommand = _require.redisCommand;

var log = require('@openagenda/logs')('get');
var _ = require('lodash');

module.exports = function (uidOrRequest, options, cb) {

  if (cb === undefined) {

    cb = options;

    options = {};
  }

  callbackify(get(uidOrRequest, options), cb);
};

module.exports.promise = get;
//# sourceMappingURL=get.js.map