"use strict";

require("core-js/modules/es.array.join");

var _regeneratorRuntime = require("@babel/runtime-corejs3/regenerator");

require("regenerator-runtime/runtime");

var _asyncToGenerator = require("@babel/runtime-corejs3/helpers/asyncToGenerator");

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

function get(_x) {
  return _get.apply(this, arguments);
}

function _get() {
  _get = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(uidOrRequest) {
    var options,
        _args = arguments;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};

            if (_.isObject(uidOrRequest) && uidOrRequest.cookies) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", _getFromUid(uidOrRequest, options));

          case 3:
            return _context.abrupt("return", _getFromRequest(uidOrRequest, options));

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _get.apply(this, arguments);
}

function _getFromRequest(_x2) {
  return _getFromRequest2.apply(this, arguments);
}

function _getFromRequest2() {
  _getFromRequest2 = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2(request) {
    var options,
        cookieUser,
        stored,
        _args2 = arguments;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            options = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {};
            cookieUser = cleanSession(request.session).user;

            if (cookieUser) {
              _context2.next = 4;
              break;
            }

            return _context2.abrupt("return", null);

          case 4:
            _context2.next = 6;
            return _getFromUid(cookieUser.uid, options);

          case 6:
            stored = _context2.sent;

            if (stored) {
              _context2.next = 9;
              break;
            }

            return _context2.abrupt("return", null);

          case 9:
            return _context2.abrupt("return", _.extend(cookieUser, stored));

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getFromRequest2.apply(this, arguments);
}

function _getFromUid(_x3) {
  return _getFromUid2.apply(this, arguments);
}

function _getFromUid2() {
  _getFromUid2 = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee3(uid) {
    var options,
        result,
        _args3 = arguments;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            options = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : {};
            _context3.next = 3;
            return redisCommand('get', [config.redis.prefix, uid].join(':'));

          case 3:
            result = _context3.sent;

            if (result) {
              _context3.next = 6;
              break;
            }

            return _context3.abrupt("return", null);

          case 6:
            _context3.prev = 6;
            return _context3.abrupt("return", JSON.parse(result));

          case 10:
            _context3.prev = 10;
            _context3.t0 = _context3["catch"](6);
            log('error', 'could not parse store for user %s: %s', uid, result);
            return _context3.abrupt("return", null);

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[6, 10]]);
  }));
  return _getFromUid2.apply(this, arguments);
}
//# sourceMappingURL=get.js.map