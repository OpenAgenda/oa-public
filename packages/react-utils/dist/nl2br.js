'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = nl2br;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function nl2br(str) {

  var newlineRegex = /(\r\n|\r|\n)/g;

  if (typeof str === 'number') {
    return str;
  } else if (typeof str !== 'string') {
    return '';
  }

  return str.split(newlineRegex).map(function (line, index) {
    return line.match(newlineRegex) ? _react2.default.createElement('br', { key: index }) : line;
  });
}
module.exports = exports['default'];
//# sourceMappingURL=nl2br.js.map