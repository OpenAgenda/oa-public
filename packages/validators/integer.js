"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _number = require('./number');

var _number2 = _interopRequireDefault(_number);

var _extend = require('lodash/extend');

var _extend2 = _interopRequireDefault(_extend);

var _listify = require('./listify');

var _listify2 = _interopRequireDefault(_listify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function (config) {

  var params = (0, _extend2['default'])({
    field: false,
    optional: true,
    min: null,
    max: null,
    'default': null,
    list: false
  }, config || {}),
      validateNumber = (0, _number2['default'])(params),
      integerValidator = (0, _extend2['default'])(validate, {
    type: 'integer',
    field: params.field
  });

  return params.list ? (0, _listify2['default'])(integerValidator, params) : integerValidator;

  function validate(value) {

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

      throw [(0, _extend2['default'])({
        code: 'integer.invalid',
        message: 'not an integer',
        origin: value
      }, params.field ? { field: params.field } : {})];
    }

    return clean;
  }
};

module.exports = exports['default'];
//# sourceMappingURL=integer.js.map