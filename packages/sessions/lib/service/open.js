"use strict";

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var open = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(request, response, identifier) {
    var user, sessionUser, cookieData, sessionKey;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (config.initialized) {
              _context.next = 2;
              break;
            }

            throw new Error('service has not been initialized');

          case 2:

            log('attempting session open for user %j', identifier);

            _context.next = 5;
            return getUser(identifier);

          case 5:
            user = _context.sent;
            sessionUser = null, cookieData = null;

            if (user) {
              _context.next = 10;
              break;
            }

            log('info', 'no user matching user was found for identifier %j', identifier);

            return _context.abrupt('return', {
              success: false,
              errors: [{ code: 'user.notfound' }]
            });

          case 10:
            _context.prev = 10;


            sessionUser = validate(_.extend({
              latestActivity: new Date()
            }, user));

            _context.next = 18;
            break;

          case 14:
            _context.prev = 14;
            _context.t0 = _context['catch'](10);


            log('error', 'user validation failed on %j', user);

            return _context.abrupt('return', { errors: _context.t0, success: false });

          case 18:
            _context.prev = 18;
            sessionKey = [config.redis.prefix, sessionUser.uid].join(':');
            _context.next = 22;
            return redisCommand('set', [sessionKey, (0, _stringify2.default)(sessionUser)]);

          case 22:
            _context.next = 24;
            return redisCommand('expire', [sessionKey, config.expire]);

          case 24:
            _context.next = 30;
            break;

          case 26:
            _context.prev = 26;
            _context.t1 = _context['catch'](18);


            log('error', 'session could not be stored in redis for user %s', user);

            throw new VError(_context.t1, 'sessions could not be stored in redis for user %j', user);

          case 30:

            // store session in cookie

            cookieData = cookieValidate({ user: sessionUser });

            cleanSession(request.session, cookieData);

            // clear writable cookie
            if (response) {

              expressCookie(config.writableCookie.name, request, response).clear();
            }

            log('info', 'session opened', {
              uid: user.uid,
              email: user.email
            });

            return _context.abrupt('return', {
              success: true,
              data: sessionUser,
              cookieData: cookieData,
              errors: []
            });

          case 35:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[10, 14], [18, 26]]);
  }));

  return function open(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require('./config');

var _require = require('./helpers'),
    cleanSession = _require.cleanSession,
    callbackify = _require.callbackify,
    interfaces = _require.interfaces,
    redisCommand = _require.redisCommand,
    getUser = _require.getUser;

var cookieValidate = require('../../iso/cookie.validate');
var log = require('@openagenda/logs')('sessions/open');
var validate = require('./validate');
var expressCookie = require('./expressCookie');
var _ = require('lodash');
var VError = require('verror');

module.exports = function (request, response, identifier, cb) {

  if (!cb) {

    cb = identifier;
    identifier = response;
    response = null;
  }

  callbackify(open(request, response, identifier), cb);
};

module.exports.promise = open;
//# sourceMappingURL=open.js.map