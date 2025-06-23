"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = withFieldValueMatches;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _get2 = _interopRequireDefault(require("lodash/get.js"));
var _choice = _interopRequireDefault(require("../choice"));
function withFieldValueMatches(fieldOptions, withKey, values, fields) {
  var _context, _fields$withField;
  const withParams = (0, _get2.default)(fieldOptions, withKey);
  const withField = typeof withParams === 'string' ? withParams : withParams.field;
  const value = values === undefined ? undefined : values[withField];
  const evaluateRefFieldAsTruthy = typeof withParams === 'string';
  if (evaluateRefFieldAsTruthy && value instanceof Array && !value.length) {
    return false;
  }
  if (evaluateRefFieldAsTruthy && (0, _includes.default)(_context = [undefined, null, false]).call(_context, value)) {
    return false;
  }
  if (evaluateRefFieldAsTruthy) {
    return true;
  }
  if ((_fields$withField = fields[withField]) !== null && _fields$withField !== void 0 && _fields$withField.options) {
    return !!_choice.default.preClean({
      options: [].concat(withParams.value)
    }, value).length;
    // return !!choice.preClean(fields[withField], withParams.value).length;
  }
  if (value instanceof Array) {
    return (0, _includes.default)(value).call(value, withParams.value);
  }
  return [].concat(value).filter(v => {
    var _context2;
    return (0, _includes.default)(_context2 = [].concat(withParams.value)).call(_context2, v);
  }).length;
}
module.exports = exports.default;
//# sourceMappingURL=withFieldValueMatches.js.map