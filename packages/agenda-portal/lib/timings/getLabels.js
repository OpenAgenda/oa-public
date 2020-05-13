'use strict';

const moment = require('moment-timezone');

const { tz } = moment;

module.exports = (timing, timezone = 'Europe/Paris', locale = 'en') => ({
  start: {
    day: tz(timing.start, timezone)
      .locale(locale)
      .format('dddd D'),
    time: tz(timing.start, timezone)
      .locale(locale)
      .format('LT')
  },
  end: {
    day: tz(timing.start, timezone)
      .locale(locale)
      .format('dddd D'),
    time: tz(timing.end, timezone)
      .locale(locale)
      .format('LT')
  }
});
