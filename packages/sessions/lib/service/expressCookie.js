"use strict";

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = void 0;

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

    response.cookie(name, new Buffer((0, _stringify2.default)({})).toString('base64'), { maxAge: 1 });
  }

  function set(key, update) {

    values[key] = update;

    var encoded = new Buffer((0, _stringify2.default)(values)).toString('base64');

    request.cookies[name] = encoded;

    response.cookie(name, encoded, { maxAge: config.writableCookie.maxAge });
  }
};

function _decode(req, name) {

  var encoded = req.cookies[name];

  var decoded = {};

  if (!encoded) return decoded;

  try {

    decoded = JSON.parse(new Buffer(encoded, 'base64').toString());
  } catch (e) {}

  return decoded;
}

module.exports.init = function (c) {
  return config = c;
};
//# sourceMappingURL=expressCookie.js.map