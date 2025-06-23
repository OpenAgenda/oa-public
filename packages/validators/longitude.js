"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _errors = _interopRequireDefault(require("./lib/errors"));
var _default = exports.default = function _default() {
  let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const params = (0, _objectSpread2.default)({
    field: false,
    optional: true
  }, config);
  return Object.assign(value => {
    if (value === undefined && params.optional) {
      return null;
    }
    const clean = parseFloat(value);
    if (Number.isNaN(clean)) {
      throw (0, _errors.default)(params, value, 'longitude.invalid', 'not a number');
    }
    if (clean < -180) {
      throw (0, _errors.default)(params.field, value, 'longitude.toosmall', 'longitude cannot be less than -180');
    }
    if (clean > 180) {
      throw (0, _errors.default)(params.field, value, 'longitude.toobig', 'longitude cannot be more than 180');
    }
    return clean;
  }, {
    type: 'longitude',
    field: params.field
  });
};
module.exports = exports.default;
//# sourceMappingURL=longitude.js.map