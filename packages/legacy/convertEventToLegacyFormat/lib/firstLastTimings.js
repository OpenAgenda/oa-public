'use strict';

const moment = require('moment-timezone');

module.exports = timings => {
  const utcOffset = moment.parseZone(timings[0].begin).utcOffset();

  const firstDate = moment(timings[0].begin).format('YYYY-MM-DD');
  const firstTimeStart = moment.utc(timings[0].begin).utcOffset(utcOffset).format('HH:mm');
  const firstTimeEnd = moment.utc(timings[0].end).utcOffset(utcOffset).format('HH:mm');

  const lastTiming = timings[(timings.length - 1)];
  const lastDate = moment(lastTiming.begin).format('YYYY-MM-DD');
  const lastTimeStart = moment.utc(lastTiming.begin).utcOffset(utcOffset).format('HH:mm');
  const lastTimeEnd = moment.utc(lastTiming.end).utcOffset(utcOffset).format('HH:mm');

  return {
    firstDate, firstTimeStart, firstTimeEnd, lastDate, lastTimeStart, lastTimeEnd
  };
};
