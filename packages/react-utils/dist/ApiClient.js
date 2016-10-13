'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var superagent = require('superagent');

var methods = ['get', 'post', 'put', 'patch', 'del'];

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
    _this[method] = function (path) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var query = _ref.query;
      var data = _ref.data;
      var headers = _ref.headers;
      var files = _ref.files;
      var fields = _ref.fields;
      return new Promise(function (resolve, reject) {
        var request = superagent[method](_this.formatUrl(path));

        if (query) {
          request.query(query);
        }

        if (typeof window === 'undefined' && req && req.get('cookie')) {
          request.set('cookie', req.get('cookie'));
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
          var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var body = _ref2.body;
          return err ? reject(body || err) : resolve(body);
        });
      });
    };
  });
};

module.exports = ApiClient;