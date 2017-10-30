"use strict"; // ES5

var utils = require('@openagenda/utils');

module.exports = function (config) {

  var params = utils.extend({
    field: false,
    optional: true
  }, config || {});

  return utils.extend(validate, {
    field: params.field,
    type: 'longitude'
  });

  function validate(value) {

    if (value === undefined && params.optional) {

      return null;
    }

    var clean = parseFloat(value);

    if (isNaN(clean)) {

      throw [{
        field: params.field,
        code: 'longitude.invalid',
        message: 'not a number',
        origin: value
      }];
    }

    if (clean < -180) {

      throw [{
        field: params.field,
        code: 'longitude.toosmall',
        message: 'longitude cannot be less than -180',
        origin: value
      }];
    }

    if (clean > 180) {

      throw [{
        field: params.field,
        code: 'longitude.toobig',
        message: 'longitude cannot be more than 180',
        origin: value
      }];
    }

    return clean;
  }
};
//# sourceMappingURL=longitude.js.map