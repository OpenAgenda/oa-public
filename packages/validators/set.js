"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function (validators, options) {

  validate.type = 'set';

  var params = _utils2['default'].extend({
    compact: false
  }, options || {});

  return validate;

  function validate(valuesSet) {

    var errors = [],
        clean = [],
        compacted = {};

    validators.forEach(function (validator) {

      var matchingValue = valuesSet.filter(function (v) {

        return v.field === validator.field;
      });

      matchingValue = matchingValue.length ? matchingValue[0] : { field: validator.field, value: undefined };

      try {

        clean.push({
          field: matchingValue.field,
          value: validator(matchingValue.value)
        });
      } catch (e) {

        errors = errors.concat(e);
      }
    });

    if (errors.length) {

      throw errors;
    }

    if (params.compact) {

      clean.forEach(function (c) {

        compacted[c.field] = c.value;
      });

      return compacted;
    }

    return clean;
  }
};

module.exports = exports['default'];
//# sourceMappingURL=set.js.map