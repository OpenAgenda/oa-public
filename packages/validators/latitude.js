"use strict"; // ES5

var utils = require('@openagenda/utils');

module.exports = function (config) {

  var params = utils.extend({
    field: false,
    optional: true
  }, config || {});

  return utils.extend(validate, {
    field: params.field,
    type: 'latitude'
  });

  function validate(value) {

    if (value === undefined && params.optional) {

      return null;
    }

    var clean = parseFloat(value);

    if (isNaN(clean)) {

      throw [{
        field: params.field,
        code: 'latitude.invalid',
        message: 'not a number',
        origin: value
      }];
    }

    if (clean < -90) {

      throw [{
        field: params.field,
        code: 'latitude.toosmall',
        message: 'latitude cannot be less than -90',
        origin: value
      }];
    }

    if (clean > 90) {

      throw [{
        field: params.field,
        code: 'latitude.toobig',
        message: 'latitude cannot be more than 90',
        origin: value
      }];
    }

    return clean;
  }
};
//# sourceMappingURL=latitude.js.map