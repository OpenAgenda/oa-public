"use strict";

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    process.nextTick(cb.bind(null, null, result));
  }, function (err) {

    process.nextTick(cb.bind(null, err));
  });
}

function interfaces(name, args) {

  return new _promise2.default(function (rs, rj) {

    config.interfaces[name].apply(null, (_.isArray(args) ? args : [args]).concat(function (err, result) {

      if (err) return rj(err);

      rs(result);
    }));
  });
}

function cleanSession() {
  var session = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  var filtered = _.pick(session, (0, _keys2.default)(session)),
      clean = {};

  try {

    clean = cookieValidate(_.extend(filtered, data));
  } catch (e) {
    log('error', e);
  }

  (0, _keys2.default)(clean).forEach(function (k) {
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