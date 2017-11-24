"use strict";

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var close = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(request) {
    var cookieUser, result;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cookieUser = cleanSession(request.session).user;

            if (cookieUser) {
              _context.next = 3;
              break;
            }

            return _context.abrupt('return', {
              success: false,
              errors: [{ code: 'user.notfound' }]
            });

          case 3:
            _context.next = 5;
            return redisCommand('del', [config.redis.prefix, cookieUser.uid].join(':'));

          case 5:
            result = _context.sent;


            request.session = null;

            return _context.abrupt('return', {
              success: true
            });

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function close(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
//# sourceMappingURL=close.js.map