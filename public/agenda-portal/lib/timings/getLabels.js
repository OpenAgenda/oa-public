'use strict';

const moment = require('moment-timezone');

const { getKey: getBeginKey, getValue: getBeginValue } = require('./begin');

const { tz } = moment;

module.exports = (timing, timezone = 'Europe/Paris', locale = 'en') => {
  const beginKey = getBeginKey(timing);
  const beginValue = getBeginValue(timing);

  return {
    [beginKey]: {
      day: tz(beginValue, timezone)
        .locale(locale)
        .format('dddd D'),
      time: tz(beginValue, timezone)
        .locale(locale)
        .format('LT')
    },
    end: {
      day: tz(beginValue, timezone)
        .locale(locale)
        .format('dddd D'),
      time: tz(timing.end, timezone)
        .locale(locale)
        .format('LT')
    }
  };
};
