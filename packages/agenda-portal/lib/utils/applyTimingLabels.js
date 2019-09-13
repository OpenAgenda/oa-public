'use strict';

const moment = require('moment-timezone');

const { tz } = moment;

module.exports = (timezone = 'Europe/Paris', timing) => Object.assign(timing, {
  labels: {
    start: {
      day: tz(timing.start, timezone).format('LL'),
      time: tz(timing.start, timezone).format('LT')
    },
    end: {
      day: tz(timing.start, timezone).format('LL'),
      time: tz(timing.end, timezone).format('LT')
    }
  }
});
