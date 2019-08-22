'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const moment = require('moment');

function _appendLabel(timing) {
  return _.assign(timing, {
    label: _.capitalize(moment(timing.start).fromNow())
  });
}

// assumes timings are sorted
module.exports = event => {
  if (!event.timings || !event.timings.length) {
    return event;
  }

  const last = event.timings.slice(-1)[0];
  const now = new Date();

  const update = {
    lastTiming: { $set: _appendLabel(last) },
    nextTiming: { $set: null }
  };

  if (last && new Date(last.end) < now) {
    // if last is in the past, there is no next timing

    return ih(event, update);
  }

  for (const t of event.timings) {
    // go through timings, keep the first one that finishes in the future
    if (new Date(t.end) > now) {
      update.nextTiming = { $set: _appendLabel(t) };

      break;
    }
  }

  return ih(event, update);
};
