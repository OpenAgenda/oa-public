'use strict';

const moment = require('moment-timezone');
const fZ = n => (`${n}`.length === 1 ? '0' : '') + n;

module.exports.from = ({ date, hours, minutes }, timezone = 'Europe/Paris') => moment.tz(
  `${date}T${fZ(hours)}:${fZ(minutes)}`,
  timezone
).locale('en').toISOString(true);

module.exports.to = (date, timezone = 'Europe/Paris') => {
  const m =  moment.tz(date, timezone).locale('en');
  return {
    date: m.format('YYYY-MM-DD'),
    hours: m.format('HH'),
    minutes: m.format('mm')
  }
};