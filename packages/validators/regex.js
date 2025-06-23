"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/es.regexp.exec.js");
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _errors = _interopRequireDefault(require("./lib/errors"));
var _default = exports.default = function _default() {
  let config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const params = (0, _objectSpread2.default)({
    optional: false,
    field: false,
    // required
    regex: false,
    // required
    error: {
      // replace with something more specific
      code: 'regex.mismatch',
      message: 'regex does not match'
    },
    clean: false,
    // if true result of regex is clean value
    trim: true,
    type: false,
    min: null,
    max: null
  }, config);
  const validator = value => {
    let clean = value ? "".concat(value) : value;
    if (params.optional && (!clean || !clean.length)) {
      return 'default' in params ? params.default : clean;
    }
    if (!params.optional && !clean) {
      throw (0, _errors.default)(params, value, 'required', 'value must not be empty');
    }
    if (typeof clean === 'string' && (0, _trim.default)(params)) {
      clean = (0, _trim.default)(clean).call(clean);
    }
    if (params.min !== null && clean.length < params.min) {
      throw (0, _errors.default)(params, value, 'tooshort', 'value is too short');
    }
    if (params.max !== null && clean.length > params.max) {
      throw (0, _errors.default)(params, value, 'toolong', 'value is too long');
    }
    if (!params.regex.test(clean)) {
      throw (0, _errors.default)(params, value, params.error.code, params.error.message);
    }
    return params.clean ? clean.match(params.regex)[0] : clean;
  };
  if (params.type) {
    validator.type = params.type;
  }
  if (params.field) {
    validator.field = params.field;
  }
  return validator;
};
module.exports = exports.default;
//# sourceMappingURL=regex.js.map