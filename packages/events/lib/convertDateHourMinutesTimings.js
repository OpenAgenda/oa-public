'use strict';

const moment = require('moment-timezone');

const log = require('@openagenda/logs')('convertDateMinuteHourTimings');
const { is: isDateHourMinutesTiming } = require('./validators/dateHourMinutesTiming');

const fZ = n => (`${n}`.length === 1 ? '0' : '') + n;

const convert = ({ date, hours, minutes }, timezone = 'Europe/Paris') => moment.tz(
  `${date}T${fZ(hours)}:${fZ(minutes)}`,
  timezone
).locale('en').toISOString(true);

const convertTo = (date, timezone = 'Europe/Paris') => {
  const m =  moment.tz(date, timezone).locale('en');
  return {
    date: m.format('YYYY-MM-DD'),
    hours: m.format('HH'),
    minutes: m.format('mm')
  }
};

module.exports = (timings, timezone) => {
  if (!timings || !timings.length) {
    return;
  }

  if (!isDateHourMinutesTiming(timings[0])) {
    return;
  }

  log('converting from DHM timings');

  timings.forEach(t => {
    t.begin = convert(t.begin, timezone);
    t.end = convert(t.end, timezone);
  });
};

module.exports.to = (timings, timezone) => {
  if (!timings || !timings.length) {
    return;
  }

  if (isDateHourMinutesTiming(timings[0])) {
    return;
  }

  log('converting to DHM timings');

  timings.forEach(t => {
    t.begin = convertTo(t.begin, timezone);
    t.end = convertTo(t.end, timezone);
  })
}