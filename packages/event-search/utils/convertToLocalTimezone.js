'use strict';

const moment = require('moment-timezone');
const ih = require('immutability-helper');

module.exports = event => {
  if (!event.timezone || !event.timings) {
    return event;
  }

  return ih(event, {
    timings: {
      $set: event.timings.map(t => ({
        begin: moment.tz(t.begin, event.timezone).format(),
        end: moment.tz(t.end, event.timezone).format()
      }))
    }
  });
}
