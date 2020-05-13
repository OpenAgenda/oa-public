'use strict';

const moment = require('moment-timezone');

const { tz } = moment;

module.exports = (timing, timezone = 'Europe/Paris', locale = 'en') => ({
  ...timing,
  ...{
    start: tz(timing.start, timezone)
      .locale(locale)
      .format(),
    end: tz(timing.end, timezone)
      .locale(locale)
      .format()
  }
});
