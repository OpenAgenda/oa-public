import moment from 'moment-timezone';

import schema from '@openagenda/validators/schema/index.js';
import date from '@openagenda/validators/date.js';

import compareBeginAndEnd from '../compareBeginAndEnd.js';

schema.register({
  date,
});

const validate = schema({
  begin: {
    type: 'date',
    optional: false,
  },
  end: {
    type: 'date',
    optional: false,
  },
});

const hasExplicitTimezone = (d) => {
  if (typeof d !== 'string') return false;
  // Z, +02:00, -05:30, +0200, +02, .000Z, .000+02:00
  return /(\.\d{3})?([+-]\d{2}:?\d{2}?|Z)$/.test(d);
};

function localizeDateString(d, options = {}) {
  const { timezone = 'Europe/Paris' } = options;

  if (d == null) {
    return d;
  }

  if (d instanceof Date) {
    return d;
  }

  if (hasExplicitTimezone(d)) {
    return new Date(d);
  }

  return moment.tz(d, timezone).toDate();
}

export default (value, options = {}) => {
  const { begin, end } = validate({
    begin: localizeDateString(value.begin, options),
    end: localizeDateString(value.end, options),
  });

  compareBeginAndEnd(begin, end, value);

  return { begin, end };
};
