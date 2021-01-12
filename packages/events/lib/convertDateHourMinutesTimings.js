'use strict';

const moment = require('moment-timezone');

const log = require('@openagenda/logs')('convertDateMinuteHourTimings');
const { is: isDateHourMinutesTiming } = require('./validators/dateHourMinutesTiming');

const fZ = n => (`${n}`.length === 1 ? '0' : '') + n;

const convert = ({ date, hours, minutes }, timezone = 'Europe/Paris') => moment.tz(
  `${date}T${fZ(hours)}:${fZ(minutes)}`,
  timezone
).locale('en').toISOString(true);

module.exports = (timings, timezone = 'Europe/Paris') => {
  if (!timings || !timings.length) {
    return;
  }

  if (!isDateHourMinutesTiming(timings[0])) {
    return;
  }

  log('converting convertDateHourMinutesTimings');

  timings.forEach(t => {
    t.begin = convert(t.begin, timezone);
    t.end = convert(t.end, timezone);
  });
};
