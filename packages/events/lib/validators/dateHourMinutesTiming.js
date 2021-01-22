'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  date: require('@openagenda/validators/date'),
  regex: require('@openagenda/validators/regex'),
  integer: require('@openagenda/validators/integer')
});

const compareBeginAndEnd = require('./compareBeginAndEnd');
const fZ = n => (n < 10 ? '0' : '') + n;

const validate = schema({
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

module.exports = v => {
  const clean = validate(v);

  const begin = new Date(clean.begin.date + 'T' + fZ(clean.begin.hours) + ':' + fZ(clean.begin.minutes));
  const end = new Date(clean.end.date + 'T' + fZ(clean.end.hours) + ':' + fZ(clean.end.minutes));

  const errors = [];

  if (begin.toString() === 'Invalid Date') {
    errors.push({
      code: 'date.invalid',
      message: 'Invalid Date',
      origin: v.begin.date,
      field: 'begin.date'
    });
  }
  if (end.toString() === 'Invalid Date') {
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

module.exports.is = t => t && t.begin && (typeof t.begin.hours !== 'undefined');
