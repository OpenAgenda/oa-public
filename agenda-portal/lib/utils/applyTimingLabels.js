'use strict';

const moment = require('moment-timezone');

const { tz } = moment;

const {
  getKey: getBeginKey,
  getValue: getBeginValue
} = require('../timings/begin');

module.exports = (timing, timezone = 'Europe/Paris', locale = 'en') => Object.assign(timing, {
  labels: {
    [getBeginKey(timing)]: {
      day: tz(getBeginValue(timing), timezone)
        .locale(locale)
        .format('LL'),
      time: tz(getBeginValue(timing), timezone)
        .locale(locale)
        .format('LT')
    },
    end: {
      day: tz(getBeginValue(timing), timezone)
        .locale(locale)
        .format('LL'),
      time: tz(timing.end, timezone)
        .locale(locale)
        .format('LT')
    }
  }
});
