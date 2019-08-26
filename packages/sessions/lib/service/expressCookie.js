"use strict";

require("core-js/modules/es.date.to-string");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.regexp.to-string");

var _JSON$stringify = require("@babel/runtime-corejs3/core-js/json/stringify");

var _ = require('lodash');

var config;

module.exports = function (name, request, response) {
  var values = _decode(request, name);

  return {
    set: set,
    clear: clear,
    get: function get() {
      return values;
    }
  };

  function clear() {
    if (typeof response.cookie !== 'function') return;
    response.cookie(name, new Buffer(_JSON$stringify({}), 'utf8').toString('base64'), {
      maxAge: 1
    });
  }

  function set(key, update) {
    _.set(values, key, update);

    var encoded = new Buffer(_JSON$stringify(values), 'utf8').toString('base64');
    request.cookies[name] = encoded;
    response.cookie(name, encoded, {
      maxAge: config.writableCookie.maxAge,
      encode: function encode(str) {
        return str;
      }
    });
  }
};

function _decode(req, name) {
  var encoded = req.cookies[name];
  var decoded = {};
  if (!encoded) return decoded;

  try {
    decoded = JSON.parse(new Buffer(encoded, 'base64').toString('utf8'));
  } catch (e) {}

  return decoded;
}

module.exports.init = function (c) {
  return config = c;
};
//# sourceMappingURL=expressCookie.js.map