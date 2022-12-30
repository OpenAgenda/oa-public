'use strict';

const moment = require('moment-timezone');

module.exports = function convertTimingsRange(timingsRange) {
  const {
    range,
    timezone = 'Europe/Paris'
  } = timingsRange;

  if (range === 'today') {
    const now = moment(new Date());

    const dateInTimezone = now.tz(timezone).format('YYYY-MM-DD');

    const zone = now.tz(timezone).format('Z');

    return {
      gte: `${dateInTimezone}T00:00:00.000${zone}`,
      lte: `${dateInTimezone}T23:59:59.999${zone}`
    };
  }
};
