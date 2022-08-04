'use strict';

const getLabels = require('./getLabels');
const getSchemaJSONLD = require('./getSchemaJSONLD');
const links = require('./links');

module.exports = function detailedTiming({ event, req }, timing, locale = 'en') {
  const { defaultTimezone } = req?.app?.locals ?? {};
  const timezone = event.timezone || event.location.timezone || defaultTimezone;

  return ({
    ...timing,
    labels: getLabels(timing, timezone, locale),
    JSONLD: getSchemaJSONLD(event, timing, defaultTimezone),
    ...links({ event, req }, timing),
  });
};
