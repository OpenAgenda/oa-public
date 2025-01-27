'use strict';

const labels = require('@openagenda/labels/agendas/range');

const moment = require('moment-timezone');

function countSameWeekday(start, end, weekday, timezone = 'Europe/Paris') {
  let count = 0;
  const endDate = moment.tz(end, timezone).format('YYYY-MM-DD');
  const currentDate = new Date(start);

  while (moment.tz(currentDate, timezone).format('YYYY-MM-DD') <= endDate) {
    if (currentDate.getDay() === weekday) {
      count += 1;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

module.exports = (timings, lang, timezone = 'Europe/Paris') => {
  if (!timings || !timings.length || !(timings instanceof Array)) {
    return '';
  }
  const weekdays = [];
  const days = [];
  for (const timing of timings) {
    const weekday = moment.tz(timing.start, timezone).day();
    const day = moment.tz(timing.start, timezone).format('YYYY-MM-DD');
    if (weekdays.indexOf(weekday) === -1) {
      weekdays.push(weekday);
    }
    if (days.indexOf(day) === -1) {
      days.push(day);
    }
  }
  if (weekdays.length > 1) {
    return '';
  }
  const weekday = weekdays[0];
  const numberOfSameWeekday = countSameWeekday(
    timings[0].start,
    timings[timings.length - 1].start,
    weekday,
    timezone,
  );

  if (numberOfSameWeekday === days.length) {
    return `${labels[`all-weekday-${weekday}`][lang]}`;
  }
  if (numberOfSameWeekday > days.length) {
    return `${labels[`some-weekday-${weekday}`][lang]}`;
  }
};
