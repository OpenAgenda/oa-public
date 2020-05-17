'use strict';

const { tz } = require('moment-timezone');

module.exports = (v1, { timezone }) => {
  const v2 = {};
  if (!v1) {
    return v2;
  }

  if (v1.from || v1.to) {
    const fromAtDayStart = tz(v1.from || v1.to, timezone);
    const toAtDayEnd = tz(v1.to || v1.from, timezone);

    fromAtDayStart.hour(0);
    fromAtDayStart.minutes(0);
    toAtDayEnd.hour(23);
    toAtDayEnd.minutes(59);

    v2.date = {
      gte: fromAtDayStart.format(),
      lte: toAtDayEnd.format()
    };
  }

  return v2;
};
