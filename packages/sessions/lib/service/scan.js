"use strict";

var _regeneratorRuntime = require("@babel/runtime-corejs3/regenerator");

var _getIterator = require("@babel/runtime-corejs3/core-js/get-iterator");

var _concatInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/concat");

var _parseInt = require("@babel/runtime-corejs3/core-js/parse-int");

require("regenerator-runtime/runtime");

var _asyncToGenerator = require("@babel/runtime-corejs3/helpers/asyncToGenerator");

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

function scan(_x, _x2) {
  return _scan.apply(this, arguments);
}

function _scan() {
  _scan = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(cursor, limit) {
    var options,
        iterationFetches,
        updatedCursor,
        result,
        fetchedSessions,
        _iteratorNormalCompletion,
        _didIteratorError,
        _iteratorError,
        _iterator,
        _step,
        key,
        _args = arguments;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
            iterationFetches = [], updatedCursor = -1;

          case 2:
            if (!(iterationFetches.length < limit && updatedCursor !== 0)) {
              _context.next = 11;
              break;
            }

            if (updatedCursor === -1) {
              updatedCursor = cursor;
            }

            _context.next = 6;
            return redisCommand('scan', [updatedCursor, 'match', config.redis.prefix + '*', 'count', limit]);

          case 6:
            result = _context.sent;
            updatedCursor = _parseInt(result[0]);
            iterationFetches = _concatInstanceProperty(iterationFetches).call(iterationFetches, result[1]);
            _context.next = 2;
            break;

          case 11:
            fetchedSessions = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 15;
            _iterator = _getIterator(iterationFetches);

          case 17:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 29;
              break;
            }

            key = _step.value;
            _context.t0 = fetchedSessions;
            _context.t1 = JSON;
            _context.next = 23;
            return redisCommand('get', key);

          case 23:
            _context.t2 = _context.sent;
            _context.t3 = _context.t1.parse.call(_context.t1, _context.t2);

            _context.t0.push.call(_context.t0, _context.t3);

          case 26:
            _iteratorNormalCompletion = true;
            _context.next = 17;
            break;

          case 29:
            _context.next = 35;
            break;

          case 31:
            _context.prev = 31;
            _context.t4 = _context["catch"](15);
            _didIteratorError = true;
            _iteratorError = _context.t4;

          case 35:
            _context.prev = 35;
            _context.prev = 36;

            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }

          case 38:
            _context.prev = 38;

            if (!_didIteratorError) {
              _context.next = 41;
              break;
            }

            throw _iteratorError;

          case 41:
            return _context.finish(38);

          case 42:
            return _context.finish(35);

          case 43:
            return _context.abrupt("return", {
              sessions: fetchedSessions,
              cursor: updatedCursor
            });

          case 44:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[15, 31, 35, 43], [36,, 38, 42]]);
  }));
  return _scan.apply(this, arguments);
}
//# sourceMappingURL=scan.js.map