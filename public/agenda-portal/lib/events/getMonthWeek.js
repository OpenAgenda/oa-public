'use strict';

const { tz } = require('moment-timezone');

module.exports = (d, timezone) => Math.ceil(
  (tz(d, timezone).diff(
    tz(d, timezone)
      .date(1)
      .day(1),
    'days'
  )
      + 1)
      / 7
);
