"use strict";

require("core-js/modules/es.array.join");

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.function.name");

var _regeneratorRuntime = require("@babel/runtime-corejs3/regenerator");

var _JSON$stringify = require("@babel/runtime-corejs3/core-js/json/stringify");

require("regenerator-runtime/runtime");

var _asyncToGenerator = require("@babel/runtime-corejs3/helpers/asyncToGenerator");

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

function open(_x, _x2, _x3) {
  return _open.apply(this, arguments);
}

function _open() {
  _open = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(request, response, identifier) {
    var user, sessionUser, cookieData, sessionKey;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
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
            return _context.abrupt("return", {
              success: false,
              errors: [{
                code: 'user.notfound'
              }]
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
            _context.t0 = _context["catch"](10);
            log('error', 'user validation failed on %j', user, _context.t0);
            return _context.abrupt("return", {
              errors: _context.t0,
              success: false
            });

          case 18:
            _context.prev = 18;
            sessionKey = [config.redis.prefix, sessionUser.uid].join(':');
            _context.next = 22;
            return redisCommand('set', [sessionKey, _JSON$stringify(sessionUser)]);

          case 22:
            _context.next = 24;
            return redisCommand('expire', [sessionKey, config.expire]);

          case 24:
            _context.next = 30;
            break;

          case 26:
            _context.prev = 26;
            _context.t1 = _context["catch"](18);
            log('error', 'session could not be stored in redis for user %s', user);
            throw new VError(_context.t1, 'sessions could not be stored in redis for user %j', user);

          case 30:
            // store session in cookie
            cookieData = cookieValidate({
              user: sessionUser
            });
            cleanSession(request.session, cookieData); // clear writable cookie

            if (response) {
              expressCookie(config.writableCookie.name, request, response).clear();
            }

            log('info', 'session opened', {
              uid: user.uid,
              email: user.email
            });
            return _context.abrupt("return", {
              success: true,
              data: sessionUser,
              cookieData: cookieData,
              errors: []
            });

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[10, 14], [18, 26]]);
  }));
  return _open.apply(this, arguments);
}
//# sourceMappingURL=open.js.map