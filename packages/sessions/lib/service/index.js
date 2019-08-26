"use strict";

require("core-js/modules/es.function.name");

var _regeneratorRuntime = require("@babel/runtime-corejs3/regenerator");

require("regenerator-runtime/runtime");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _asyncToGenerator = require("@babel/runtime-corejs3/helpers/asyncToGenerator");

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

var config, interfaces;
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
  isLogged: isLogged,
  getCulture: getCulture,
  middleware: middleware
};

function set(cookieName, request, response, name, value) {
  expressCookie(cookieName, request, response).set(name, value);
}

function isLogged(_x) {
  return _isLogged.apply(this, arguments);
}

function _isLogged() {
  _isLogged = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(request) {
    var user;
    return _regeneratorRuntime.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return get.promise(request);

          case 2:
            user = _context2.sent;
            return _context2.abrupt("return", !!user);

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee);
  }));
  return _isLogged.apply(this, arguments);
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
  var _context;

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

  _forEachInstanceProperty(_context = [get, open, close, sync, scan]).call(_context, function (end) {
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