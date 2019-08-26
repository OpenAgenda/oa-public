"use strict";

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _Object$keys = require("@babel/runtime-corejs3/core-js/object/keys");

var _concatInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/concat");

var _Promise = require("@babel/runtime-corejs3/core-js/promise");

var _bindInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/bind");

var _ = require('lodash');

var cookieValidate = require('../../../iso/cookie.validate');

var log = require('@openagenda/logs')('helpers');

var config = require('../config');

var redisCommand = require('./redisCommand');

module.exports = {
  cleanSession: cleanSession,
  interfaces: interfaces,
  init: init,
  shutdown: shutdown,
  callbackify: callbackify,
  redisCommand: redisCommand,
  getUser: getUser
};

function getUser(identifier) {
  try {
    return interfaces('getUser', identifier);
  } catch (e) {
    log('error', e);
    throw e;
  }
}

function callbackify(p, cb) {
  p.then(function (result) {
    // do not handle sync errors in callback with promise
    process.nextTick(_bindInstanceProperty(cb).call(cb, null, null, result));
  }, function (err) {
    process.nextTick(_bindInstanceProperty(cb).call(cb, null, err));
  });
}

function interfaces(name, args) {
  return new _Promise(function (rs, rj) {
    var _context;

    config.interfaces[name].apply(null, _concatInstanceProperty(_context = _.isArray(args) ? args : [args]).call(_context, function (err, result) {
      if (err) return rj(err);
      rs(result);
    }));
  });
}

function cleanSession() {
  var _context2;

  var session = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var filtered = _.pick(session, _Object$keys(session)),
      clean = {};

  try {
    clean = cookieValidate(_.extend(filtered, data));
  } catch (e) {
    log('error', e);
  }

  _forEachInstanceProperty(_context2 = _Object$keys(clean)).call(_context2, function (k) {
    return session[k] = clean[k];
  });

  return session;
}

function init() {
  redisCommand.init();
}

function shutdown() {
  redisCommand.shutdown();
}
//# sourceMappingURL=index.js.map