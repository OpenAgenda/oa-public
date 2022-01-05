'use strict';

const moment = require('moment-timezone');

module.exports = timings => timings.map(timing => {
  const start = moment(timing.begin).toISOString();
  const end = moment(timing.end).toISOString();
  return { start, end };
});
