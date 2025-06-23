"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
/**
 * makes validator process lists
 */

function isNothing(validator, v) {
  var _context, _context2;
  if ((0, _includes.default)(_context = ['integer', 'number']).call(_context, validator.type) && v === '') {
    return true;
  }
  return (0, _includes.default)(_context2 = [undefined, null]).call(_context2, v);
}
var _default = (validator, options) => {
  const params = (0, _objectSpread2.default)({
    min: null,
    max: null,
    optional: options.optional === undefined ? true : !!options.optional
  }, options.list);
  return Object.assign(v => {
    const clean = [];
    let errors = [];
    let value = isNothing(validator, v) ? [] : v;
    if (params.default !== undefined) {
      if (v === params.default) {
        return params.default;
      }
      if (v === undefined) {
        return params.default;
      }
    }
    if (!Array.isArray(value)) {
      value = [value];
    }
    value.forEach((item, i) => {
      try {
        clean.push(validator(item));
      } catch (errs) {
        errors = errors.concat(errs.map(e => (0, _objectSpread2.default)((0, _objectSpread2.default)({}, e), {}, {
          index: i
        })));
      }
    });
    if (!params.optional && value.length === 0) {
      errors.push({
        field: validator.field,
        code: 'list.required',
        message: 'list cannot be empty',
        origin: value
      });
    } else if ((!params.optional || value.length > 0) && params.min !== null && value.length < params.min) {
      errors.push({
        field: validator.field,
        code: 'list.tooshort',
        message: 'list is too short',
        origin: value
      });
    }
    if (params.max !== null && value.length > params.max) {
      errors.push({
        field: validator.field,
        code: 'list.toolong',
        message: 'list is too long',
        origin: value
      });
    }
    if (errors.length) throw errors;
    return clean;
  }, {
    type: validator.type,
    field: validator.field
  });
};
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=listify.js.map