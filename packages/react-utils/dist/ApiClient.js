'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var superagent = require('superagent');
var deepExtend = require('deep-extend');

var methods = ['get', 'post', 'put', 'patch', 'del'];

var defaultOptions = {
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
};

var ApiClient = function ApiClient(apiRoot, req) {
  var _this = this;

  _classCallCheck(this, ApiClient);

  this.apiRoot = apiRoot;

  this.formatUrl = function (path) {
    var adjustedPath = path[0] !== '/' ? '/' + path : path;
    if (typeof window === 'undefined') {
      // Prepend host and port of the API server to the path.
      return _this.apiRoot + adjustedPath;
    }
    return adjustedPath;
  };

  methods.forEach(function (method) {
    _this[method] = function (path, options) {
      return new Promise(function (resolve, reject) {
        var _deepExtend = deepExtend({}, defaultOptions, options),
            query = _deepExtend.query,
            data = _deepExtend.data,
            headers = _deepExtend.headers,
            files = _deepExtend.files,
            fields = _deepExtend.fields;

        var request = superagent[method](_this.formatUrl(path));

        if (query) {
          request.query(query);
        }

        if (typeof window === 'undefined' && req) {
          if (req.get('cookie')) {
            request.set('cookie', req.get('cookie'));
          }

          if (req.get('x-forwarded-for')) {
            request.set('x-forwarded-for', req.get('x-forwarded-for'));
          }
        }

        if (headers) {
          request.set(headers);
        }

        if (files) {
          files.forEach(function (file) {
            return request.attach(file.key, file.value);
          });
        }

        if (fields) {
          fields.forEach(function (item) {
            return request.field(item.key, item.value);
          });
        }

        if (data) {
          request.send(data);
        }

        request.end(function (err) {
          var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
              body = _ref.body;

          return err ? reject(body || err) : resolve(body);
        });
      });
    };
  });
};

module.exports = ApiClient;