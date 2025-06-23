"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extend = _interopRequireDefault(require("lodash/extend"));
var _listify = _interopRequireDefault(require("./listify"));
var _default = config => {
  const params = (0, _extend.default)({
      field: undefined,
      type: 'pass',
      list: false,
      default: undefined
    }, config || {}),
    validator = (0, _extend.default)(validate, {
      type: 'pass',
      field: params.field
    });
  return params.list ? (0, _listify.default)(validator, params) : validator;
  function validate(v) {
    if (v === undefined && params.default !== undefined) {
      return params.default;
    }
    return v;
  }
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=pass.js.map