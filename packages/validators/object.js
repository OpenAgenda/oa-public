"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

var _listify = require('./listify');

var _listify2 = _interopRequireDefault(_listify);

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

  var params = _utils2.default.extend({
    field: null,
    list: false
  }, options),
      validator = _utils2.default.extend(validate, {
    type: 'object',
    field: params.field
  });

  return params.list ? (0, _listify2.default)(validator) : validator;

  function validate(values) {

    var clean = [],
        errors = [];

    validators.forEach(function (validator) {

      var matchingValue = (values || []).filter(function (v) {
        return v.field === validator.field;
      });

      matchingValue = matchingValue.length ? matchingValue[0] : {
        field: validator.field,
        value: validator.type === 'object' ? [] : undefined
      };

      if (validator.type !== 'object') {

        try {

          clean.push({
            field: matchingValue.field,
            value: validator(matchingValue.value)
          });
        } catch (e) {

          errors = errors.concat(e);
        }
      } else if (_typeof(matchingValue.value) !== 'object') {

        errors = errors.concat([{
          field: matchingValue.field,
          origin: matchingValue.value,
          code: 'object.invalidtype',
          message: 'not an object'
        }]);
      } else {

        try {

          clean = clean.concat(validator(matchingValue.value).map(function (c) {
            return _utils2.default.extend(c, {
              field: matchingValue.field + '.' + c.field
            });
          }));
        } catch (e) {

          errors = errors.concat(e.map(function (objErr) {
            return _utils2.default.extend(objErr, {
              field: matchingValue.field + '.' + objErr.field
            });
          }));
        }
      }
    });

    if (errors.length) {

      throw errors;
    }

    return clean;
  }
};