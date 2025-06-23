"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
var _listify = _interopRequireDefault(require("./listify"));
var _params = _interopRequireDefault(require("./lib/params"));
var _errors = _interopRequireDefault(require("./lib/errors"));
var _default = config => {
  const params = (0, _params.default)('text', config, {
    field: false,
    // required
    min: 0,
    max: 1000000,
    trim: true,
    optional: true,
    default: null,
    list: false,
    strict: false,
    emptyStringAsUndefined: true
  }, config || {});
  const validate = value => {
    var _context;
    let clean = (0, _includes.default)(_context = [undefined, null]).call(_context, value) ? '' : "".concat(value);
    if (typeof value === 'object' && clean) {
      throw (0, _errors.default)(params, value, 'string.invalidtype', 'not a string');
    }
    if (value !== undefined && typeof value !== 'string' && params.strict) {
      throw (0, _errors.default)(params, value, 'string.invalidtype', 'not a string');
    }
    if ((0, _trim.default)(params)) {
      clean = (0, _trim.default)(clean).call(clean);
    }
    if (value === undefined || value === null || !clean.length && params.emptyStringAsUndefined) {
      var _context2;
      if (params.optional || !(0, _includes.default)(_context2 = [undefined, null]).call(_context2, params.default)) {
        return params.default;
      }
      throw (0, _errors.default)(params, value, 'required', 'a string is required');
    }
    if (clean.length < params.min) {
      throw (0, _errors.default)(params, value, 'string.tooshort', 'the string is too short', {
        values: {
          min: params.min,
          max: params.max
        }
      });
    }
    if (clean.length > params.max) {
      throw (0, _errors.default)(params, value, 'string.toolong', 'the string is too long', {
        values: {
          min: params.min,
          max: params.max
        }
      });
    }
    return clean;
  };
  const validator = Object.assign(validate, {
    type: 'text',
    field: params.field
  });
  return params.list ? (0, _listify.default)(validator, params) : validator;
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=text.js.map