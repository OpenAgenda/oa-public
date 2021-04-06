'use strict';

const moment = require('moment-timezone');
const { produce } = require('immer');

module.exports = produce(event => {
  if (!event.timezone || !event.timings) {
    return event;
  }

  event.timings = event.timings.map(t => ({
    begin: moment.tz(t.begin, event.timezone).format(),
    end: moment.tz(t.end, event.timezone).format()
  }));
});
