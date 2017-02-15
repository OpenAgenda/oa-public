"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('lodash/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function (config) {

  var params = _core2['default'].extend({
    field: false,
    options: [], // required. Put something
    key: 'value', // optional. For when labeled objects are given
    optional: true,
    min: null,
    max: null,
    'default': null,
    unique: false
  }, config);

  return _core2['default'].extend(function (value) {

    var clean = [].concat(value).map(function (v) {
      return _core2['default'].isObject(v) ? v[params.key] : v;
    }).filter(function (v) {
      return params.options.indexOf(v) !== -1;
    });

    if (!clean.length && params['default'] !== null) {

      clean = [].concat(params['default']);
    }

    if (!params.optional && !clean.length) {

      throw [_getError(params, value, {
        code: 'choice.required',
        message: 'a (known) value must be chosen'
      })];
    }

    if (params.unique) {

      return clean.length >= 1 ? clean[0] : clean;
    }

    if (params.min && clean.length < params.min) {

      throw [_getMinMaxError(params, value, 'choice.required.min')];
    }

    if (params.max && clean.length > params.max) {

      throw [_getMinMaxError(params, value, 'choice.required.max')];
    }

    return clean;
  }, {
    type: 'choice',
    field: params.field
  });
};

function _getError(params, origin, error) {

  return _core2['default'].extend({
    origin: origin
  }, params.field ? { field: params.field } : {}, error);
}

function _getMinMaxError(params, origin, code) {

  var values = {},
      message = void 0;

  if (params.min !== null && params.max) {

    return _getError(params, origin, {
      message: 'between %min% and %max% choices must be made',
      values: { min: params.min, max: params.max },
      code: code
    });
  } else if (!params.max) {

    return _getError(params, origin, {
      message: 'at least %min% choices must be made',
      values: { min: params.min },
      code: code
    });
  } else {

    return _getError(params, origin, {
      message: 'a maximum of %max% choices is allowed',
      values: { max: params.max },
      code: code
    });
  }
}
module.exports = exports['default'];