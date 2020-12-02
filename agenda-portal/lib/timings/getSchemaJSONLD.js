'use strict';

const { tz } = require('moment-timezone');
const getJSONDuration = require('./getJSONDuration');
const { getValue: getBeginValue } = require('./begin');

module.exports = (event, timing) => {
  const { end, permalink } = timing;

  const begin = getBeginValue(timing);

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
      ...(event.image ? { image: [event.image] } : {}),
      startDate: tz(begin, event.location.timezone).format('YYYY-MM-DDTHH:mm'),
      endDate: tz(end, event.location.timezone).format('YYYY-MM-DDTHH:mm'),
      duration: getJSONDuration(begin, end),
      ...(event.registration.filter(r => r.type === 'link').length
        ? {
          offers: {
            '@type': 'Offer',
            url: event.registration.filter(r => r.type === 'link')[0].value
          }
        }
        : {}),
      ...(event.age
        ? {
          typicalAgeRange: [event.age.min, event.age.max].join('-')
        }
        : {}),
      location: {
        '@type': 'Place',
        name: event.location.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: event.location.address,
          addressLocality: event.location.city,
          addressRegion: event.location.region,
          postalCode: event.location.postalCode,
          addressCountry: event.location.countryCode
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: event.location.latitude,
          longitude: event.location.longitude
        }
      }
    },
    null,
    2
  );
};
