'use strict';

const _ = require('lodash');
const getTimingsSchemaJSONLD = require('../timings/getSchemaJSONLD');
const {
  getValue: getBeginValue,
  getKey: getBeginKey,
} = require('../timings/begin');

function get(event, { defaultTimezone }) {
  const firstTiming = _.first(event.timings);
  return getTimingsSchemaJSONLD(
    event,
    {
      [getBeginKey(firstTiming)]: getBeginValue(firstTiming),
      end: _.last(event.timings).end,
    },
    defaultTimezone,
  );
}

module.exports = (event, options) => ({
  ...event,
  JSONLD: get(event, options),
});

module.exports.get = get;
