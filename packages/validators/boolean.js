"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function (config) {

  var params = _utils2['default'].extend({
    field: false,
    'default': undefined,
    optional: true
  }, config);

  return _utils2['default'].extend(validate, {
    type: 'boolean',
    field: params.field
  });

  function validate(value) {

    if (typeof value === 'undefined') {

      if (!params.optional && typeof params['default'] === 'undefined') {

        throw [{
          field: validate.field,
          code: 'required',
          message: 'a boolean is required',
          origin: value
        }];
      }

      if (typeof params['default'] !== 'undefined' && params['default'] !== null) {

        return !!params['default'];
      }

      return null;
    }

    if (value === null && params['default'] === null) {

      return null;
    }

    if (['0', 'false', false].indexOf(value) !== -1) {

      return false;
    }

    return !!value;
  }
};

module.exports = exports['default'];