'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = setFlashMessage;

var _jsCookie = require('js-cookie');

var _jsCookie2 = _interopRequireDefault(_jsCookie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setFlashMessage(message) {
  var cookiesManager = _jsCookie2.default.withConverter({
    read: function read(v) {
      return b64DecodeUnicode(v);
    },
    write: function write(v) {
      return b64EncodeUnicode(v);
    }
  });

  return cookiesManager.set('oa.rw', (0, _extends3.default)({}, cookiesManager.getJSON('oa.rw'), {
    flash: message
  }));
}

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}
module.exports = exports['default'];
//# sourceMappingURL=setFlashMessage.js.map