'use strict';

const getLabels = require('./getLabels');
const getSchemaJSONLD = require('./getSchemaJSONLD');
const links = require('./links');

module.exports = ({ event, req }, timing, locale = 'en') => ({
  ...timing,
  labels: getLabels(timing, event.location.timezone, locale),
  JSONLD: getSchemaJSONLD(event, timing),
  ...links({ event, req }, timing)
});
