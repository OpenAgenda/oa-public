"use strict";

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var scan = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(cursor, limit) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var iterationFetches, updatedCursor, result, fetchedSessions, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            iterationFetches = [], updatedCursor = -1;

          case 1:
            if (!(iterationFetches.length < limit && updatedCursor !== 0)) {
              _context.next = 10;
              break;
            }

            if (updatedCursor === -1) {

              updatedCursor = cursor;
            }

            _context.next = 5;
            return redisCommand('scan', [updatedCursor, 'match', config.redis.prefix + '*', 'count', limit]);

          case 5:
            result = _context.sent;


            updatedCursor = parseInt(result[0]);

            iterationFetches = iterationFetches.concat(result[1]);

            _context.next = 1;
            break;

          case 10:
            fetchedSessions = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 14;
            _iterator = (0, _getIterator3.default)(iterationFetches);

          case 16:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 28;
              break;
            }

            key = _step.value;
            _context.t0 = fetchedSessions;
            _context.t1 = JSON;
            _context.next = 22;
            return redisCommand('get', key);

          case 22:
            _context.t2 = _context.sent;
            _context.t3 = _context.t1.parse.call(_context.t1, _context.t2);

            _context.t0.push.call(_context.t0, _context.t3);

          case 25:
            _iteratorNormalCompletion = true;
            _context.next = 16;
            break;

          case 28:
            _context.next = 34;
            break;

          case 30:
            _context.prev = 30;
            _context.t4 = _context['catch'](14);
            _didIteratorError = true;
            _iteratorError = _context.t4;

          case 34:
            _context.prev = 34;
            _context.prev = 35;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 37:
            _context.prev = 37;

            if (!_didIteratorError) {
              _context.next = 40;
              break;
            }

            throw _iteratorError;

          case 40:
            return _context.finish(37);

          case 41:
            return _context.finish(34);

          case 42:
            return _context.abrupt('return', {
              sessions: fetchedSessions,
              cursor: updatedCursor
            });

          case 43:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[14, 30, 34, 42], [35,, 37, 41]]);
  }));

  return function scan(_x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require('./config');

var _require = require('./helpers'),
    cleanSession = _require.cleanSession,
    callbackify = _require.callbackify,
    redisCommand = _require.redisCommand;

var log = require('@openagenda/logs')('scan');
var _ = require('lodash');

module.exports = function (cursor, count, options, cb) {

  if (arguments.length == 3) {

    options = {};
    cb = arguments[2];
  } else if (arguments.length == 2) {

    count = 10;
    options = {};
    cb = arguments[1];
  }

  callbackify(scan(cursor, count, options), function (err, r) {

    if (err) return cb(err);

    cb(null, r.sessions, r.cursor);
  });
};
//# sourceMappingURL=scan.js.map