'use strict';

const moment = require('moment-timezone');

const { tz } = moment;

module.exports = (timing, timezone = 'Europe/Paris', locale = 'en') => Object.assign(timing, {
  labels: {
    start: {
      day: tz(timing.start, timezone)
        .locale(locale)
        .format('LL'),
      time: tz(timing.start, timezone)
        .locale(locale)
        .format('LT')
    },
    end: {
      day: tz(timing.start, timezone)
        .locale(locale)
        .format('LL'),
      time: tz(timing.end, timezone)
        .locale(locale)
        .format('LT')
    }
  }
});
