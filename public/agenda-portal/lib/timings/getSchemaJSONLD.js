'use strict';

const { formatInTimeZone } = require('date-fns-tz');
const { toEventSchema } = require('@openagenda/sdk-js');

module.exports = (event, timing, defaultTimezone = 'Europe/Paris') => {
  const schemaOrg = toEventSchema({
    ...event,
    timings: [timing],
  }, {
    // locale: 'en', // should not be used
    formatDate: (date, timezone = defaultTimezone) => formatInTimeZone(date, timezone, 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
    url: timing.permalink
      || event.permalink
      || `https://openagenda.com/events/${event.slug}`,
  });

  return JSON.stringify(schemaOrg);
};
