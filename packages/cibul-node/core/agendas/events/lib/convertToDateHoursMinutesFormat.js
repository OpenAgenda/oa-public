'use strict';

const { produce } = require('immer');

function convertToDateHoursMinutesTimings({ utils }) {
  return event => produce(event, draft => {
    utils.convertDateHoursMinutesTimings.to(draft.timings, draft.timezone);
  });
}

module.exports = convertToDateHoursMinutesTimings;
