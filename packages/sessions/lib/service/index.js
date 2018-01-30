"use strict";

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var isLogged = function () {
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
            return _context.abrupt('return', !!user);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function isLogged(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require('lodash');
var logger = require('@openagenda/logs');
var middleware = require('../middleware');
var isoConfig = require('../../iso/config');
var cookieValidate = require('../../iso/cookie.validate');
var expressCookie = require('./expressCookie');
var serviceConfig = require('./config');
var get = require('./get');
var open = require('./open');
var close = require('./close');
var scan = require('./scan');
var sync = require('./sync');
var helpers = require('./helpers/index');

var config = void 0,
    interfaces = void 0;

var log = console.log;

module.exports = {
  init: init,
  shutdown: shutdown,
  open: open,
  get: get,
  scan: scan,
  sync: sync,
  close: close,
  setFlash: function setFlash(req, res, message) {
    return set(config.writableCookie.name, req, res, 'flash', message);
  },
  setCulture: function setCulture(req, res, culture) {
    return set(config.sessionCookie.name, req, res, 'user.culture', culture);
  },
  isLogged: isLogged,
  getCulture: getCulture,
  middleware: middleware
};

function set(cookieName, request, response, name, value) {

  expressCookie(cookieName, request, response).set(name, value);
}

function getCulture(request) {

  try {

    var user = cookieValidate(request.session).user;

    if (user) return user.culture;
  } catch (e) {
    console.log(e);
  }

  return null;
}

function init(c) {

  serviceConfig.init(c);

  config = c;

  config.sessionCookie = _.extend({}, c.sessionCookie, {
    name: isoConfig.cookies.session
  });

  config.writableCookie = _.extend({}, c.writableCookie, {
    name: isoConfig.cookies.writable
  });

  if (c.logger) {

    logger.setModuleConfig(c.logger);
  }

  helpers.init();

  [get, open, close, sync, scan].forEach(function (end) {

    if (end.init) end.init();
  });

  log = logger('sessions');

  interfaces = c.interfaces;

  middleware.init(config, module.exports);

  expressCookie.init(config);
}

function shutdown(c) {

  helpers.shutdown();
}
//# sourceMappingURL=index.js.map