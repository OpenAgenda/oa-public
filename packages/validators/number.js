"use strict";

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
integer: require( 'react-form-components/validators/integer' )
state: validators.integer( { field: 'state', min: 0, max: 1, default: 1 } )
*/

module.exports = function (config) {

  var params = _utils2.default.extend({
    field: false, // required
    min: undefined, // minus infinity if defined
    max: undefined, // infinity and beyond?
    default: undefined, // if set, no input cleans to this
    optional: true
  }, config || {});

  return _utils2.default.extend(validate, {
    type: 'email',
    field: params.field
  });

  function validate(value) {

    var clean = void 0;

    if (typeof value == 'string' && value.length) {

      clean = parseInt(value, 10);
    } else if (typeof value === 'number') {

      clean = value;
    }

    // we have a clean value, we can check if it fits
    // in what we want.

    if (clean === undefined && params.default) {

      return params.default;
    }

    if (clean === undefined && params.optional) {

      return null;
    }

    if (clean === undefined && !params.optional) {

      throw [{
        field: validate.field,
        code: 'required',
        message: 'a number is required',
        origin: value
      }];
    }

    if (isNaN(clean)) {

      throw [{
        field: validate.field,
        code: 'number.invalid',
        message: 'not a number',
        origin: value
      }];
    }

    if (params.min !== undefined && clean < params.min) {

      throw [{
        field: validate.field,
        code: 'number.toosmall',
        message: 'the number is too small',
        values: {
          min: params.min
        },
        origin: value
      }];
    }

    if (params.max !== undefined && clean > params.max) {

      throw [{
        field: params.field,
        code: 'number.toobig',
        message: 'the number is too big',
        values: {
          max: params.max
        },
        origin: value
      }];
    }

    return clean;
  }
};