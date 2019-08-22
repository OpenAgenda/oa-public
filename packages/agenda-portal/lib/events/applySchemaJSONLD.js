'use strict';

const _ = require('lodash');
const getTimingsSchemaJSONLD = require('../timings/getSchemaJSONLD');

function get(event) {
  return getTimingsSchemaJSONLD(event, {
    start: _.first(event.timings).start,
    end: _.last(event.timings).end
  });
}

module.exports = event => ({
  ...event,
  JSONLD: get(event)
});
