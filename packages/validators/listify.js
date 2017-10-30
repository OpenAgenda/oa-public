"use strict";

var _extend = require('lodash/extend');

var _extend2 = _interopRequireDefault(_extend);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * makes validator process lists
 */

module.exports = function (validator, options) {

  var params = (0, _extend2['default'])({
    min: null,
    max: null,
    optional: options.optional === undefined ? true : !!options.optional
  }, options.list);

  return (0, _extend2['default'])(validate, {
    type: validator.type,
    field: validator.field
  });

  function validate(v) {

    var clean = [],
        errors = [],
        value = [undefined, null].includes(v) ? [] : v;

    if (v === undefined && params['default'] !== undefined) {

      return params['default'];
    }

    if (!(0, _isArray2['default'])(value)) {

      value = [value];
    }

    value.forEach(function (item, i) {

      try {

        clean.push(validator(item));
      } catch (errs) {

        errors = errors.concat(errs.map(function (e) {
          return (0, _extend2['default'])(e, { index: i });
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
//# sourceMappingURL=listify.js.map