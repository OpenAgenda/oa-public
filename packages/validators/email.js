"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
var _isEmail = _interopRequireDefault(require("validator/lib/isEmail"));
var _params = _interopRequireDefault(require("./lib/params"));
var _errors = _interopRequireDefault(require("./lib/errors"));
var _listify = _interopRequireDefault(require("./listify"));
var _default = config => {
  const params = (0, _params.default)('email', config, {
    optional: true
  });
  const validate = Object.assign(value => {
    const clean = typeof value === 'string' ? (0, _trim.default)(value).call(value) : '';
    if (!value && params.optional) {
      return null;
    }
    if (clean.indexOf(' ') !== -1 || !(0, _isEmail.default)(clean)) {
      throw (0, _errors.default)(params, value, 'email.invalid', 'email is not valid');
    }
    if (clean.split('@').length > 2) {
      throw (0, _errors.default)(params, value, 'email.invalid', 'email is not valid');
    }
    return clean;
  }, {
    type: 'email',
    field: params.field
  });
  return params.list ? (0, _listify.default)(validate, params) : validate;
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=email.js.map