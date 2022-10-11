'use strict';

const moment = require('moment-timezone');

module.exports = function getFirstLastTimings(timings) {
  const firstDateUTCOffset = moment.parseZone(timings[0].begin).utcOffset();

  const firstDate = moment(timings[0].begin).format('YYYY-MM-DD');
  const firstTimeStart = moment.utc(timings[0].begin).utcOffset(firstDateUTCOffset).format('HH:mm');
  const firstTimeEnd = moment.utc(timings[0].end).utcOffset(firstDateUTCOffset).format('HH:mm');

  const lastTiming = timings[timings.length - 1];
  const lastDateUTCOffset = moment.parseZone(lastTiming.begin).utcOffset();
  const lastDate = moment(lastTiming.begin).format('YYYY-MM-DD');
  const lastTimeStart = moment.utc(lastTiming.begin).utcOffset(lastDateUTCOffset).format('HH:mm');
  const lastTimeEnd = moment.utc(lastTiming.end).utcOffset(lastDateUTCOffset).format('HH:mm');

  return {
    firstDate,
    firstTimeStart,
    firstTimeEnd,
    lastDate,
    lastTimeStart,
    lastTimeEnd,
  };
};
