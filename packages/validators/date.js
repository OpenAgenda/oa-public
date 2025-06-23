"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _params = _interopRequireDefault(require("./lib/params"));
var _errors = _interopRequireDefault(require("./lib/errors"));
var _default = config => {
  const params = (0, _params.default)('date', config, {
    field: false,
    min: undefined,
    max: undefined,
    default: undefined,
    optional: true
  });
  return Object.assign(value => {
    var _context;
    let clean;
    const isUndefinedOrNull = (0, _includes.default)(_context = [undefined, null]).call(_context, value);
    if (isUndefinedOrNull && params.default === 'now') {
      return new Date();
    }
    if (isUndefinedOrNull && params.default === null) {
      return null;
    }
    if (isUndefinedOrNull && params.default instanceof Date) {
      return new Date(params.default.getTime());
    }
    if (isUndefinedOrNull && !params.optional) {
      throw (0, _errors.default)(params, value, 'date.required', 'a date is required');
    }
    if (isUndefinedOrNull) {
      return value;
    }
    if (typeof value === 'string') {
      clean = new Date(value);
      if (clean.toString() === 'Invalid Date') {
        throw (0, _errors.default)(params, value, 'date.invalid', 'not a date');
      }
    } else if (value instanceof Date) {
      clean = new Date(value.getTime());
    } else {
      throw (0, _errors.default)(params, value, 'date.invalid', 'not a date');
    }
    if (params.min && clean < params.min) {
      throw (0, _errors.default)(params, value, 'date.toosmall', 'date is too small', {
        values: {
          min: params.min
        }
      });
    }
    if (params.max && clean > params.max) {
      throw (0, _errors.default)(params, value, 'date.toobig', 'date is too big', {
        values: {
          max: params.max
        }
      });
    }
    return clean;
  }, {
    type: 'date',
    field: params.field
  });
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=date.js.map