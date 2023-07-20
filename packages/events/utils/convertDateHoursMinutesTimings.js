'use strict';

const log = require('@openagenda/logs')('convertDateMinuteHourTimings');
const { is: isDateHoursMinutesTiming } = require('../iso/src/validators/dateHoursMinutesTiming');

const {
  from: convert,
  to: convertTo
} = require('../iso/src/convertDateHoursMinutesTiming');

module.exports = (timings, timezone) => {
  if (!timings || !timings.length) {
    return;
  }

  if (!isDateHoursMinutesTiming(timings[0])) {
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

  if (isDateHoursMinutesTiming(timings[0])) {
    return;
  }

  log('converting to DHM timings');

  timings.forEach(t => {
    t.begin = convertTo(t.begin, timezone);
    t.end = convertTo(t.end, timezone);
  })
}
