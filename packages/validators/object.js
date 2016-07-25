"use strict";

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MODES = {
  KEYED: 'keyed',
  LIST: 'list'
};

module.exports = function (options, validators) {

  if (arguments.length === 1) {

    validators = options;
    options = {};
  }

  validate.type = 'object';

  validate.field = options ? options.field : null;

  return validate;

  function validate(values) {

    var clean = [],
        errors = [];

    validators.forEach(function (validator) {

      var matchingValue = values.filter(function (v) {
        return v.field === validator.field;
      });

      matchingValue = matchingValue.length ? matchingValue[0] : {
        field: validator.field,
        value: undefined
      };

      try {

        clean.push({
          field: matchingValue.field,
          value: validator(matchingValue.value)
        });
      } catch (e) {

        errors = errors.concat(e);
      }
    });

    if (errors.length && validate.field) {

      throw [{
        field: validate.field,
        errors: errors
      }];
    }

    if (errors.length) {

      throw errors;
    }

    return clean;
  }
};