"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _isStream = _interopRequireDefault(require("is-stream"));
var _errors = _interopRequireDefault(require("./lib/errors"));
function isFile(value) {
  return (0, _isStream.default)(value) || value && value.path;
}
var _default = config => {
  const params = (0, _objectSpread2.default)({
    field: undefined,
    list: false,
    type: 'stream',
    optional: true
  }, config);
  return Object.assign(value => {
    if (value === undefined && !params.optional) {
      throw (0, _errors.default)(params, value, 'required', 'a stream is required');
    }
    if (value === undefined) {
      return params.default;
    }
    if (params.allowNull && value === null) {
      return null;
    }
    if (params.allowObject && value instanceof Object) {
      return value;
    }
    if (isFile(value)) {
      return value;
    }
    throw (0, _errors.default)(params, value, 'invalid', 'value is not a stream');
  }, {
    type: 'stream',
    field: params.field
  });
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=stream.js.map