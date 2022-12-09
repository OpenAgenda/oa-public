'use strict';

const { tz } = require('moment-timezone');
const imageToUrl = require('../../utils/imageToUrl');
const getJSONDuration = require('./getJSONDuration');
const { getValue: getBeginValue } = require('./begin');

function getEventAttendanceMode(code) {
  const attendanceMode = {
    1: 'OfflineEventAttendanceMode',
    2: 'OnlineEventAttendanceMode',
    3: 'MixedEventAttendanceMode',
  }[code] ?? 'OfflineEventAttendanceMode';

  return `https://schema.org/${attendanceMode}`;
}

function getEventStatus(code) {
  const status = {
    1: 'EventScheduled',
    2: 'EventRescheduled',
    3: 'EventMovedOnline',
    4: 'EventPostponed',
    5: 'EventScheduled', // but full.
    6: 'EventCacelled',
  }[code] ?? 'EventScheduled';

  return `https://schema.org/${status}`;
}

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
      eventAttendanceMode: getEventAttendanceMode(event.attendanceMode),
      eventStatus: getEventStatus(event.status),
      ...event.registration.some(r => r.type === 'link')
        ? {
          offers: {
            '@type': 'Offer',
            url: event.registration.find(r => r.type === 'link').value,
            availability: `https://schema.org/${event.status === 5 ? 'SoldOut' : 'InStock'}`,
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
