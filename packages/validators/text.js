"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (config) {

  var params = _utils2.default.extend({
    field: false, // required
    min: 0,
    max: 1000000,
    trim: true,
    optional: true
  }, config || {});

  return _utils2.default.extend(validate, {
    type: 'text',
    field: params.field
  });

  function validate(value) {

    var clean = value ? value + '' : '';

    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' && clean) {

      // there is something there and it is not a string

      throw [{
        field: validate.field,
        code: 'string.invalidtype',
        message: 'not a string',
        origin: value
      }];
    }

    if (params.trim) {

      clean = clean.trim();
    }

    if (typeof value === 'undefined' || value === null || !clean.length) {

      if (params.optional) return null;

      throw [{
        field: validate.field,
        code: 'required',
        message: 'a string is required',
        origin: value
      }];
    }

    if (clean.length < params.min) {

      throw [{
        field: validate.field,
        code: 'string.tooshort',
        message: 'the string is too short',
        values: {
          min: params.min,
          max: params.max
        },
        origin: value
      }];
    }

    if (clean.length > params.max) {

      throw [{
        field: validate.field,
        code: 'string.toolong',
        message: 'the string is too long',
        values: {
          min: params.min,
          max: params.max
        },
        origin: value
      }];
    }

    return clean;
  }
};