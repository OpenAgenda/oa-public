"use strict";

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * makes validator process lists
 */

module.exports = function (validator, options) {

  var params = _utils2.default.extend({
    min: null,
    max: null,
    optional: !!options.optional
  }, options.list);

  return _utils2.default.extend(validate, {
    type: validator.type,
    field: validator.field
  });

  function validate(v) {

    var clean = [],
        errors = [],
        value = v === undefined ? [] : v;

    if (!_utils2.default.isArray(value)) {

      throw [{
        field: validator.field,
        code: 'list.wrongtype',
        message: 'value should be a list',
        origin: value
      }];
    }

    value.forEach(function (item, i) {

      try {

        clean.push(validator(item));
      } catch (errs) {

        errors = errors.concat(errs.map(function (e) {
          return _utils2.default.extend(e, { index: i });
        }));
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
  }
};