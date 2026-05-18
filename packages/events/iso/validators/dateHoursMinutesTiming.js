import schema from '@openagenda/validators/schema/index';
import date from '@openagenda/validators/date';
import regex from '@openagenda/validators/regex';
import integer from '@openagenda/validators/integer';

import compareBeginAndEnd from '../compareBeginAndEnd.js';

import { from as convertFromDateHoursMinutesTiming } from '../convertDateHoursMinutesTiming.js';

schema.register({
  date,
  regex,
  integer,
});

const validate = schema({
  begin: {
    date: {
      type: 'regex',
      regex: /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-3][0-9]$/,
      optional: false,
    },
    hours: {
      type: 'integer',
      min: 0,
      max: 23,
      optional: false,
    },
    minutes: {
      type: 'integer',
      min: 0,
      max: 59,
      optional: false,
    },
  },
  end: {
    date: {
      type: 'regex',
      regex: /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-3][0-9]$/,
      optional: false,
    },
    hours: {
      type: 'integer',
      min: 0,
      max: 23,
      optional: false,
    },
    minutes: {
      type: 'integer',
      min: 0,
      max: 59,
      optional: false,
    },
  },
});

function is(t) {
  return t && t.begin && typeof t.begin.hours !== 'undefined';
}

function validateDateHoursMinutesTiming(v) {
  const clean = validate(v);

  const errors = [];

  const begin = convertFromDateHoursMinutesTiming(clean.begin, v.timezone);
  const end = convertFromDateHoursMinutesTiming(clean.end, v.timezone);

  if (begin === null) {
    errors.push({
      code: 'date.invalid',
      message: 'Invalid Date',
      origin: v.begin.date,
      field: 'begin.date',
    });
  }
  if (end === null) {
    errors.push({
      code: 'date.invalid',
      message: 'Invalid Date',
      origin: v.end.date,
      field: 'end.date',
    });
  }

  if (errors.length) {
    throw errors;
  }

  compareBeginAndEnd(begin, end, v);

  return clean;
}

export default Object.assign(validateDateHoursMinutesTiming, {
  is,
});
