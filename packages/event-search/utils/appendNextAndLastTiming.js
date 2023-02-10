'use strict';

const { produce } = require('immer');

module.exports = produce(event => {
  if (!event.timings || !event.timings.length) {
    return event;
  }

  const now = new Date();

  Object.assign(event, {
    lastTiming: event.timings.slice(-1).shift(),
    nextTiming: null,
  });

  if (event.lastTiming && (new Date(event.lastTiming) < now)) {
    return event;
  }

  for (const timing of event.timings) {
    if (new Date(timing.end) < now) {
      continue;
    }
    event.nextTiming = timing;
    break;
  }

  return event;
});
