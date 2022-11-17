'use strict';

const { tz } = require('moment-timezone');
const imageToUrl = require('../../utils/imageToUrl');
const getJSONDuration = require('./getJSONDuration');
const { getValue: getBeginValue } = require('./begin');

module.exports = (event, timing, defaultTimezone) => {
  const { end, permalink } = timing;

  const begin = getBeginValue(timing);
  const timezone = event.timezone || (event.location && event.location.timezone) || defaultTimezone;

  return JSON.stringify(
    {
      '@id':
        permalink
        || event.permalink
        || `https://openagenda.com/events/${event.slug}`,
      '@context': 'http://schema.org',
      '@type': 'Event',
      name: event.title,
      description: event.description,
      url:
        permalink
        || event.permalink
        || `https://openagenda.com/events/${event.slug}`,
      image: event.image ? imageToUrl(event.image) : undefined,
      startDate: tz(begin, timezone).format('YYYY-MM-DDTHH:mm'),
      endDate: tz(end, timezone).format('YYYY-MM-DDTHH:mm'),
      duration: getJSONDuration(begin, end),
      ...event.registration.some(r => r.type === 'link')
        ? {
          offers: {
            '@type': 'Offer',
            url: event.registration.find(r => r.type === 'link').value,
          },
        }
        : {},
      typicalAgeRange: event.age ? [event.age.min, event.age.max].join('-') : undefined,
      location: event.location ? {
        '@type': 'Place',
        name: event.location.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: event.location.address,
          addressLocality: event.location.city,
          addressRegion: event.location.region,
          postalCode: event.location.postalCode,
          addressCountry: event.location.countryCode,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: event.location.latitude,
          longitude: event.location.longitude,
        },
      } : null,
    },
    null,
    2,
  );
};
