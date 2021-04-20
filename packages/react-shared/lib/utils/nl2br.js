"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.match");

require("core-js/modules/es.string.split");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = nl2br;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _react = _interopRequireDefault(require("react"));

function nl2br(str) {
  var _context;

  var newlineRegex = /(\r\n|\r|\n)/g;

  if (typeof str === 'number') {
    return str;
  }

  if (typeof str !== 'string') {
    return '';
  } // TODO use react-uid


  return (0, _map.default)(_context = str.split(newlineRegex)).call(_context, function (line, index) {
    return line.match(newlineRegex) ? /*#__PURE__*/_react.default.createElement('br', {
      key: index
    }) // eslint-disable-line react/no-array-index-key
    : line;
  });
}

module.exports = exports.default;
//# sourceMappingURL=nl2br.js.map