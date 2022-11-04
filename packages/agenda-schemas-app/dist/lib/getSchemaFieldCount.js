"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/filter"));

var _get2 = _interopRequireDefault(require("lodash/get"));

var _default = function _default(schema) {
  var _context;

  return (0, _filter.default)(_context = (0, _get2.default)(schema, 'fields', [])).call(_context, function (f) {
    return f.fieldType !== 'abstract';
  }).length;
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=getSchemaFieldCount.js.map