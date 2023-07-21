'use strict';

const moment = require('moment-timezone');

const {
  is: isDateHoursMinutesTiming
} = require('../iso/src/validators/dateHoursMinutesTiming');
const {
  from: convertDHM,
} = require('../iso/src/convertDateHoursMinutesTiming');

const inLocalTZ = (d, tz) => moment.tz(d, tz).locale('en').toISOString(true);

module.exports = function convertAndInjectTimingsWithTimezone(timings, timezone) {
  if (!timings || !timings.length) {
    return timings;
  }

  return timings.map(({ begin, end }) => {
    const fn = isDateHoursMinutesTiming({ begin }) ? convertDHM : inLocalTZ;

    return {
      begin: fn(begin, timezone),
      end: fn(end, timezone),
    };
  });
}
