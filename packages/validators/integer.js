"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('lodash/core');

var _core2 = _interopRequireDefault(_core);

var _number = require('./number');

var _number2 = _interopRequireDefault(_number);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function (config) {

  var params = _core2['default'].extend({
    field: false,
    optional: true,
    min: null,
    max: null,
    'default': null
  }, config || {});

  var validateNumber = (0, _number2['default'])(params);

  return _core2['default'].extend(function (value) {

    var clean = null,
        errors = [];

    try {

      clean = validateNumber(value);
    } catch (e) {

      errors = e;
    }

    if (errors.length) {

      throw errors.map(function (e) {

        e.code = e.code.replace('number', 'integer');
        e.message = e.message.replace('number', 'integer');
      });
    }

    if (clean === null) {

      return null;
    }

    if (parseInt(clean) !== parseFloat(clean)) {

      throw [_core2['default'].extend({
        code: 'integer.invalid',
        message: 'not an integer',
        origin: value
      }, params.field ? { field: params.field } : {})];
    }

    return clean;
  }, {
    type: 'integer',
    field: params.field
  });
};

module.exports = exports['default'];