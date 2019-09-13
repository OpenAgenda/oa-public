'use strict';

const getLabels = require('./getLabels');
const getSchemaJSONLD = require('./getSchemaJSONLD');
const links = require('./links');

module.exports = ({ event, req }, timing) => ({
  ...timing,
  labels: getLabels(event.location.timezone, timing),
  JSONLD: getSchemaJSONLD(event, timing),
  ...links({ event, req }, timing)
});
