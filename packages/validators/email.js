"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extend = require('lodash/extend');

var _extend2 = _interopRequireDefault(_extend);

var _listify = require('./listify');

var _listify2 = _interopRequireDefault(_listify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var emailRgx = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

exports.default = function (config) {

  var params = (0, _extend2.default)({
    field: undefined,
    error: {
      code: 'email.invalid',
      message: 'email is not valid'
    },
    type: 'email'
  }, config || {}),
      validator = (0, _extend2.default)(validate, {
    type: 'email',
    field: params.field
  });

  return params.list ? (0, _listify2.default)(validator, params) : validator;

  function validate(value) {

    var clean = typeof value === 'string' ? value.trim() : '';

    if (clean.indexOf(' ') !== -1 || !emailRgx.test(clean)) {

      throw [{
        field: params.field,
        code: params.error.code,
        message: params.error.message,
        origin: value
      }];
    }

    return clean;
  }
};

module.exports = exports['default'];