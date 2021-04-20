import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise";
import _Promise from "@babel/runtime-corejs3/core-js/promise";
import axios from 'axios';
import qs from 'qs';
export default function apiClient(baseURL, req) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      legacy = _ref.legacy;

  var isServer = typeof window === 'undefined';
  var token;
  var instance = axios.create({
    baseURL: baseURL,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    paramsSerializer: qs.stringify
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
    return _Promise.reject(error);
  });

  if (legacy) {
    instance.interceptors.response.use(function (response) {
      return response.data;
    }, function (error) {
      return _Promise.reject(error.response && error.response.data ? error.response.data : error);
    });
  }

  return instance;
}
//# sourceMappingURL=apiClient.js.map