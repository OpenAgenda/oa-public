"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _isIP = _interopRequireDefault(require("validator/lib/isIP"));
var _listify = _interopRequireDefault(require("./listify"));
var _params = _interopRequireDefault(require("./lib/params"));
var _errors = _interopRequireDefault(require("./lib/errors"));
var _default = config => {
  const params = (0, _params.default)('ip', config, {
    field: false,
    optional: true,
    default: undefined,
    list: false
  });
  const validate = value => {
    if (value === undefined && (params.default !== undefined || params.optional)) {
      return params.default;
    }
    if (value === undefined) {
      throw (0, _errors.default)(params, value, 'ip.required', 'an ip address is required');
    }
    if (!(0, _isIP.default)(value)) {
      throw (0, _errors.default)(params, value, 'ip.invalid', 'ip address is invalid');
    }
    return value;
  };
  const validator = Object.assign(validate, {
    type: 'ip',
    field: params.field
  });
  return params.list ? (0, _listify.default)(validator, params) : validator;
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=ip.js.map