'use strict';

const labels = require('@openagenda/labels/agendas/range');
const moment = require('moment-timezone');

module.exports = (timezone = 'Europe/Paris') => {
  const weekdays = [];
  let count = 0;

  function add(timing) {
    const day = moment.tz(timing.start, timezone).day();

    count += 1;

    if (!weekdays.includes(day)) {
      weekdays.push(day);
    }
  }

  function render(lang) {
    if (weekdays.length > 1) return;

    if (count < 3) return;

    const weekdayIndex = weekdays[0];

    return labels[`weekday-${weekdayIndex}`][lang];
  }

  return {
    add,
    render,
  };
};
