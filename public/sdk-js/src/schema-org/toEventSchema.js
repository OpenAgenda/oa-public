import { getLocaleValue, DEFAULT_LANG } from '@openagenda/intl';

function getEventAttendanceMode(code) {
  return {
    1: 'OfflineEventAttendanceMode',
    2: 'OnlineEventAttendanceMode',
    3: 'MixedEventAttendanceMode',
  }[code] ?? 'OfflineEventAttendanceMode';
}

function getEventStatus(code) {
  return {
    1: 'EventScheduled',
    2: 'EventRescheduled',
    3: 'EventMovedOnline',
    4: 'EventPostponed',
    5: 'EventScheduled', // but full.
    6: 'EventCancelled',
  }[code] ?? 'EventScheduled';
}

function imageToUrl(image, type) {
  if (!image) return;

  const variant = typeof type === 'string'
    ? image.variants?.find(img => img.type === type) ?? image
    : image;

  return `${image.base}${variant.filename}`;
}

export default function toEventSchema(event, { url, locale, defaultLocale = DEFAULT_LANG, formatDate }) {
  const { timings } = event;

  const { begin } = timings[0];
  const { end } = timings.at(-1);

  const timezone = event.timezone || event.location?.timezone;

  const eventSchema = {
    '@context': 'http://schema.org',
    '@type': 'Event',
    name: getLocaleValue(event.title, locale, defaultLocale),
    description: getLocaleValue(event.description, locale, defaultLocale),
    startDate: formatDate(begin, timezone),
    endDate: formatDate(end, timezone),
    eventAttendanceMode: getEventAttendanceMode(event.attendanceMode),
    eventStatus: getEventStatus(event.status),
    ...event.registration?.some(r => r.type === 'link')
      ? {
        offers: {
          '@type': 'Offer',
          url: event.registration.find(r => r.type === 'link').value,
          availability: `https://schema.org/${event.status === 5 ? 'SoldOut' : 'InStock'}`,
        },
      }
      : {},
  };

  if (url) {
    eventSchema['@id'] = url;
    eventSchema.url = url;
  }

  if (event.image) {
    eventSchema.image = imageToUrl(event.image);
  }

  if (event.location) {
    eventSchema.location = {
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
    };
  }

  if (event.age?.min || event.age?.max) {
    eventSchema.typicalAgeRange = `${event.age.min || ''}-${event.age.max || ''}`;
  }

  return eventSchema;
}
