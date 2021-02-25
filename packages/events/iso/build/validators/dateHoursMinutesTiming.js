'use strict';

var schema = require('@openagenda/validators/schema');

schema.register({
  date: require('@openagenda/validators/date'),
  regex: require('@openagenda/validators/regex'),
  integer: require('@openagenda/validators/integer')
});

var compareBeginAndEnd = require('../compareBeginAndEnd');

var _require = require('../convertDateHoursMinutesTiming'),
    convertFromDateHoursMinutesTiming = _require.from;

var fZ = function fZ(n) {
  return (n < 10 ? '0' : '') + n;
};

var validate = schema({
  begin: {
    date: {
      type: 'regex',
      regex: /^[0-9][0-9][0-9][0-9]\-[0-9][0-9]\-[0-3][0-9]$/,
      optional: false
    },
    hours: {
      type: 'integer',
      min: 0,
      max: 23,
      optional: false
    },
    minutes: {
      type: 'integer',
      min: 0,
      max: 59,
      optional: false
    }
  },
  end: {
    date: {
      type: 'regex',
      regex: /^[0-9][0-9][0-9][0-9]\-[0-9][0-9]\-[0-3][0-9]$/,
      optional: false
    },
    hours: {
      type: 'integer',
      min: 0,
      max: 23,
      optional: false
    },
    minutes: {
      type: 'integer',
      min: 0,
      max: 59,
      optional: false
    }
  }
});

module.exports = function (v) {
  var clean = validate(v);
  var errors = [];
  var begin = convertFromDateHoursMinutesTiming(clean.begin, v.timezone);
  var end = convertFromDateHoursMinutesTiming(clean.end, v.timezone);

  if (begin === null) {
    errors.push({
      code: 'date.invalid',
      message: 'Invalid Date',
      origin: v.begin.date,
      field: 'begin.date'
    });
  }

  if (end === null) {
    errors.push({
      code: 'date.invalid',
      message: 'Invalid Date',
      origin: v.end.date,
      field: 'end.date'
    });
  }

  if (errors.length) {
    throw errors;
  }

  compareBeginAndEnd(begin, end, v);
  return clean;
};

module.exports.is = function (t) {
  return t && t.begin && typeof t.begin.hours !== 'undefined';
};
//# sourceMappingURL=dateHoursMinutesTiming.js.map