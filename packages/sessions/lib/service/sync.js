"use strict";

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var sync = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(request) {
    var user;
    return _regenerator2.default.wrap(function _callee$(_context) {
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

            return _context.abrupt('return', {
              success: false,
              errors: [{
                code: 'session.notfound'
              }]
            });

          case 5:
            _context.next = 7;
            return open.promise(request, { uid: user.uid });

          case 7:
            return _context.abrupt('return', _context.sent);

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function sync(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = require('@openagenda/logs')('sync');
var get = require('./get');
var open = require('./open');

var _require = require('./helpers'),
    callbackify = _require.callbackify;

module.exports = function (request, cb) {

  callbackify(sync(request), cb);
};
//# sourceMappingURL=sync.js.map