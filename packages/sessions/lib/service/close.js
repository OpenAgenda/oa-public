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

var log = require('@openagenda/logs')('close');

var _ = require('lodash');

module.exports = function (request, cb) {
  callbackify(close(request), cb);
};

function close(_x) {
  return _close.apply(this, arguments);
}

function _close() {
  _close = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(request) {
    var cookieUser, result;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cookieUser = cleanSession(request.session).user;

            if (cookieUser) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", {
              success: false,
              errors: [{
                code: 'user.notfound'
              }]
            });

          case 3:
            _context.next = 5;
            return redisCommand('del', [config.redis.prefix, cookieUser.uid].join(':'));

          case 5:
            result = _context.sent;
            request.session = null;
            return _context.abrupt("return", {
              success: true
            });

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _close.apply(this, arguments);
}
//# sourceMappingURL=close.js.map