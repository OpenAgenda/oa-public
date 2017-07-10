"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extend = require('lodash/extend');

var _extend2 = _interopRequireDefault(_extend);

var _listify = require('./listify');

var _listify2 = _interopRequireDefault(_listify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function (config) {

  var params = (0, _extend2['default'])({
    field: false, // required
    min: 0,
    max: 1000000,
    trim: true,
    optional: true,
    'default': null,
    list: false,
    strict: false
  }, config || {}),
      validator = (0, _extend2['default'])(validate, {
    type: 'text',
    field: params.field
  });

  return params.list ? (0, _listify2['default'])(validator, params) : validator;

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

    if (typeof value !== 'undefined' && typeof value !== 'string' && params.strict) {

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

      if (params.optional || params['default'] !== null) return params['default'];

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

module.exports = exports['default'];