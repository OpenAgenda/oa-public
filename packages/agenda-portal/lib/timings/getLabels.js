'use strict';

const moment = require('moment-timezone');

const { tz } = moment;

module.exports = (timezone = 'Europe/Paris', timing) => ({
  start: {
    day: tz(timing.start, timezone).format('dddd D'),
    time: tz(timing.start, timezone).format('LT')
  },
  end: {
    day: tz(timing.start, timezone).format('dddd D'),
    time: tz(timing.end, timezone).format('LT')
  }
});
