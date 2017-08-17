"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _listify = require('./listify');

var _listify2 = _interopRequireDefault(_listify);

var _extend = require('lodash/extend');

var _extend2 = _interopRequireDefault(_extend);

var _isIP = require('validator/lib/isIP');

var _isIP2 = _interopRequireDefault(_isIP);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function (config) {

  var params = (0, _extend2['default'])({
    field: false,
    optional: false,
    'default': undefined,
    list: false
  }, config || {}),
      ipValidator = (0, _extend2['default'])(validate, {
    type: 'ip',
    field: params.field
  });

  return params.list ? (0, _listify2['default'])(ipValidator, params) : ipValidator;

  function validate(value) {

    var clean = null,
        error = {
      origin: value,
      field: params.field
    };

    if (value === undefined && (params['default'] !== undefined || params.optional)) {

      return params['default'];
    } else if (value === undefined) {

      return [(0, _extend2['default'])(error, {
        code: 'ip.required',
        message: 'an ip address is required'
      })];
    }

    if (!(0, _isIP2['default'])(value)) {

      throw [(0, _extend2['default'])(error, {
        code: 'ip.invalid',
        message: 'ip address is invalid'
      })];
    }

    return value;
  }
};

module.exports = exports['default'];