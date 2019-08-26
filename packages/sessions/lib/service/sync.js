"use strict";

var _regeneratorRuntime = require("@babel/runtime-corejs3/regenerator");

require("regenerator-runtime/runtime");

var _asyncToGenerator = require("@babel/runtime-corejs3/helpers/asyncToGenerator");

var log = require('@openagenda/logs')('sync');

var get = require('./get');

var open = require('./open');

var _require = require('./helpers'),
    callbackify = _require.callbackify;

module.exports = function (request, cb) {
  callbackify(sync(request), cb);
};

function sync(_x) {
  return _sync.apply(this, arguments);
}

function _sync() {
  _sync = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(request) {
    var user;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return get.promise(request);

          case 2:
            user = _context.sent;

            if (user) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", {
              success: false,
              errors: [{
                code: 'session.notfound'
              }]
            });

          case 5:
            _context.next = 7;
            return open.promise(request, null, {
              uid: user.uid
            });

          case 7:
            return _context.abrupt("return", _context.sent);

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _sync.apply(this, arguments);
}
//# sourceMappingURL=sync.js.map