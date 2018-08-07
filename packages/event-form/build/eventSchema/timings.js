"use strict";

var schema = require('@openagenda/validators/schema');

var _ = {
  isArray: require('lodash/isArray'),
  extend: require('lodash/extend')
};

schema.register({
  date: require('@openagenda/validators/date')
});

var validateTiming = schema({
  begin: {
    type: 'date',
    optional: false
  },
  end: {
    type: 'date',
    optional: false
  }
});

module.exports = function () {
  return function (value) {

    if (!_.isArray(value) || !value.length) {

      throw [{
        code: 'timings.empty',
        message: 'At least one timing is required',
        field: 'timings'
      }];
    }

    var _value$reduce = value.reduce(function (carry, value, index) {

      try {

        var cleanTiming = validateTiming(value);

        if (cleanTiming.end < cleanTiming.begin) throw [{
          code: 'timings.invalid',
          message: 'end cannot happen earlier than begin',
          field: 'timings'
        }];

        carry.clean.push(value);
      } catch (e) {

        carry.errors = carry.errors.concat(e.map(function (e) {
          return _.extend(e, { index: index });
        }));
      }

      return carry;
    }, { errors: [], clean: [] }),
        errors = _value$reduce.errors,
        clean = _value$reduce.clean;

    if (errors.length) throw errors;

    return clean;
  };
};
//# sourceMappingURL=timings.js.map