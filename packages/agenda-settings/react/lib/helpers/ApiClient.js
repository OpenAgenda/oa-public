'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var methods = ['get', 'post', 'put', 'patch', 'del'];

var ApiClient = function ApiClient() {
  var _this = this;

  _classCallCheck(this, ApiClient);

  methods.forEach(function (method) {
    _this[method] = function (path) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var params = _ref.params;
      var data = _ref.data;
      var headers = _ref.headers;
      var files = _ref.files;
      var fields = _ref.fields;
      return new Promise(function (resolve, reject) {
        var request = _superagent2.default[method](path);

        if (params) {
          request.query(params);
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
          var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

          var body = _ref2.body;
          return err ? reject(body || err) : resolve(body);
        });
      });
    };
  });
};

exports.default = ApiClient;
module.exports = exports['default'];