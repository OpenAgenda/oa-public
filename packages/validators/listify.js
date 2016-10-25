"use strict";

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * makes validator process lists
 */

module.exports = function (validator) {

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

    if (errors.length) throw errors;

    return clean;
  }
};