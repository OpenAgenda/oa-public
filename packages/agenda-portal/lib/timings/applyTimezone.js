'use strict';

const moment = require('moment-timezone');
const { getValue: getBeginValue } = require('./begin');

const { tz } = moment;

module.exports = (timing, timezone = 'Europe/Paris', locale = 'en') => ({
  ...timing,
  ...{
    start: tz(getBeginValue(timing), timezone)
      .locale(locale)
      .format(),
    end: tz(timing.end, timezone)
      .locale(locale)
      .format()
  }
});
