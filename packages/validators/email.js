"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var emailRgx = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

exports.default = function (config) {

  var params = _utils2.default.extend({
    field: undefined,
    error: {
      code: 'email.invalid',
      message: 'email is not valid'
    },
    type: 'email'
  }, config || {});

  return _utils2.default.extend(validate, {
    type: 'email',
    field: params.field
  });

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