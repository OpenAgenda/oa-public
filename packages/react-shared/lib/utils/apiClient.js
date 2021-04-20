"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = apiClient;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/promise"));

var _axios = _interopRequireDefault(require("axios"));

var _qs = _interopRequireDefault(require("qs"));

function apiClient(baseURL, req) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      legacy = _ref.legacy;

  var isServer = typeof window === 'undefined';
  var token;

  var instance = _axios.default.create({
    baseURL: baseURL,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    paramsSerializer: _qs.default.stringify
  });

  instance.setJwtToken = function (newToken) {
    token = newToken;
  };

  instance.interceptors.request.use(function (conf) {
    if (isServer) {
      if (req.header('cookie')) {
        conf.headers.Cookie = req.header('cookie');
      }

      if (req.header('authorization')) {
        conf.headers.authorization = req.header('authorization');
      }
    }

    if (token) {
      conf.headers.authorization = token;
    }

    return conf;
  }, function (error) {
    return _promise.default.reject(error);
  });

  if (legacy) {
    instance.interceptors.response.use(function (response) {
      return response.data;
    }, function (error) {
      return _promise.default.reject(error.response && error.response.data ? error.response.data : error);
    });
  }

  return instance;
}

module.exports = exports.default;
//# sourceMappingURL=apiClient.js.map