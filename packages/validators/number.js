"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _errors = _interopRequireDefault(require("./lib/errors"));
var _params = _interopRequireDefault(require("./lib/params"));
var _listify = _interopRequireDefault(require("./listify"));
var _default = config => {
  const params = (0, _params.default)('number', config, {
    min: null,
    max: null
  });
  const validate = value => {
    var _context;
    let clean;
    if (typeof value === 'string' && value.length) {
      clean = parseFloat(value, 10);
    } else if (typeof value === 'number') {
      clean = value;
    }
    if (clean === undefined && !params.optional && (0, _includes.default)(_context = [undefined, null]).call(_context, params.default)) {
      throw (0, _errors.default)(params, value, 'required', 'a number is required');
    } else if (clean === undefined && params.default !== undefined) {
      return params.default;
    } else if (clean === undefined && params.optional) {
      return;
    }
    if (Number.isNaN(clean)) {
      throw (0, _errors.default)(params, value, 'number.invalid', 'not a number');
    }
    if (params.min !== null && clean < params.min) {
      throw (0, _errors.default)(params, value, 'number.toosmall', 'the number is too small', {
        values: {
          min: params.min
        }
      });
    }
    if (params.max !== null && clean > params.max) {
      throw (0, _errors.default)(params, value, 'number.toobig', 'the number is too big', {
        values: {
          max: params.max
        }
      });
    }
    return clean;
  };
  validate.type = 'number';
  validate.field = params.field;
  return params.list ? (0, _listify.default)(validate, params) : validate;
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=number.js.map