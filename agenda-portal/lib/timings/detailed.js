'use strict';

const getLabels = require('./getLabels');
const getSchemaJSONLD = require('./getSchemaJSONLD');
const links = require('./links');

module.exports = ({ event, req }, timing, locale = 'en') => {

  return ({
    ...timing,
    labels: getLabels(timing, event.timezone, locale),
    JSONLD: getSchemaJSONLD(event, timing),
    ...links({ event, req }, timing),
  });
};
