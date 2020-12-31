'use strict';

const moment = require( 'moment-timezone' );
const { is: isDateHourMinutesTiming } = require('./validators/dateHourMinutesTiming');

module.exports = (timings, timezone = 'Europe/Paris') => {
  if (!timings || !timings.length) {
    return;
  }

  if (!isDateHourMinutesTiming(timings[0])) {
    return;
  }

  timings.forEach(t => {
    t.begin = moment.tz(`${t.begin.date}T${t.begin.hours}:${t.begin.minutes}`, timezone ).locale('en').toISOString(true);
    t.end = moment.tz(`${t.end.date}T${t.end.hours}:${t.end.minutes}`, timezone ).locale('en').toISOString(true);
  });
}