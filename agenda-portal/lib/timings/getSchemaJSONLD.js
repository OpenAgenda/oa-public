import { formatInTimeZone } from 'date-fns-tz';
import { toEventSchema } from '@openagenda/sdk-js/schema-org';

// One date of the event by default: its availability and booking page are
// that date's. `wholeEvent` is for a span standing for the whole event (the
// event list's first-to-last range), which the event's summary describes.
export default (
  event,
  timing,
  defaultTimezone = 'Europe/Paris',
  { wholeEvent = false } = {},
) => {
  const schemaOrg = toEventSchema(
    wholeEvent ? { ...event, timings: [timing] } : event,
    {
      ...wholeEvent ? {} : { timing },
      // locale: 'en', // should not be used
      formatDate: (date, timezone = defaultTimezone) =>
        formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      url:
        timing.permalink
        || event.permalink
        || `https://openagenda.com/events/${event.slug}`,
    },
  );

  return JSON.stringify(schemaOrg);
};
