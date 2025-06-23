"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = latitude;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _errors = _interopRequireDefault(require("./lib/errors"));
function latitude() {
  let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const params = (0, _objectSpread2.default)({
    field: false,
    optional: true
  }, config);
  function validate(value) {
    if (value === undefined && params.optional) {
      return null;
    }
    const clean = parseFloat(value);
    if (Number.isNaN(clean)) {
      throw (0, _errors.default)(params, value, 'latitude.invalid', 'not a number');
    }
    if (clean < -90) {
      throw (0, _errors.default)(params, value, 'latitude.toosmall', 'latitude cannot be less than -90');
    }
    if (clean > 90) {
      throw (0, _errors.default)(params, value, 'latitude.toobig', 'latitude cannot be more than 90');
    }
    return clean;
  }
  return Object.assign(validate, {
    field: params.field,
    type: 'latitude'
  });
}
module.exports = exports.default;
//# sourceMappingURL=latitude.js.map