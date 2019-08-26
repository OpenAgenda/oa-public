"use strict";

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

var _bindInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/bind");

var _ = require('lodash');

var cookieSessionLib = require('cookie-session');

var cookieParserLib = require('cookie-parser');

var validateCookie = require('../iso/cookie.validate');

var cookieSession, cookieParser, sessions;
module.exports = _.extend(use, {
  open: open,
  load: load,
  close: close,
  sync: sync,
  ifLogged: _bindInstanceProperty(ifLoggedState).call(ifLoggedState, null, true),
  ifUnlogged: _bindInstanceProperty(ifLoggedState).call(ifLoggedState, null, false),
  init: init
});

function use(req, res, next) {
  if (!cookieSession) {
    throw new Error('Session service not initialized');
  }

  cookieParser(req, res, function (err) {
    cookieSession(req, res, function (err) {
      var _context;

      if (err) return next(err);

      if (_Object$keys(req.session).length) {
        return next();
      }

      _forEachInstanceProperty(_context = _Object$keys(validateCookie.validateUnlogged.default)).call(_context, function (k) {
        req.session[k] = validateCookie.validateUnlogged.default[k];
      });

      next();
    });
  });
}

function ifLoggedState(state, fn) {
  return function (req, res, next) {
    sessions.isLogged(req).catch(next).then(function (is) {
      if (state === is) return fn(req, res, next);
      next();
    });
  };
}

function close() {
  var targetNamespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'result';
  return function (req, res, next) {
    sessions.close(req, function (err, result) {
      if (err) return next(err);
      req[targetNamespace] = result;
      next();
    });
  };
}
/**
 * proxy for service sync method
 */


function sync() {
  var targetNamespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'result';
  return function (req, res, next) {
    sessions.sync(req, function (err, result) {
      if (err) return next(err);
      req[targetNamespace] = result;
      next();
    });
  };
}

function open() {
  var identifierNamespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'userIdentifier';
  var targetNamespace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'result';
  return function (req, res, next) {
    sessions.open(req, req[identifierNamespace], function (err, result) {
      if (err) return next(err);
      req[targetNamespace] = result;
      next();
    });
  };
}
/**
 * load session in req object
 */


function load(options) {
  var params = _.extend({
    target: 'user',
    detailed: false
  }, options || {});

  return function (req, res, next) {
    sessions.get(req, {
      detailed: params.detailed
    }, function (err, user) {
      if (err) return next(err);
      req[params.target] = user;

      _logLoad(req, {
        userUid: user ? user.uid : null
      });

      next();
    });
  };
}

function init(config, service) {
  cookieSession = cookieSessionLib(config.sessionCookie);
  cookieParser = cookieParserLib();
  sessions = service;
}

function _logLoad(req, data) {
  if (req.log && req.log.load) {
    req.log.load(data);
  }
}
//# sourceMappingURL=middleware.js.map