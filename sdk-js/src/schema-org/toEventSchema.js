import { getLocaleValue, DEFAULT_LANG } from '@openagenda/intl';
import { isCurrencyCode, toMajor } from '@openagenda/utils/iso4217';
import { toInstant } from '@openagenda/utils/isoDatetime';

function getEventAttendanceMode(attendanceMode) {
  return (
    {
      1: 'OfflineEventAttendanceMode',
      2: 'OnlineEventAttendanceMode',
      3: 'MixedEventAttendanceMode',
    }[Number(attendanceMode?.id ?? attendanceMode)]
    ?? 'OfflineEventAttendanceMode'
  );
}

function getEventStatus(status) {
  return (
    {
      1: 'EventScheduled',
      2: 'EventRescheduled',
      3: 'EventMovedOnline',
      4: 'EventPostponed',
      5: 'EventScheduled', // but full.
      6: 'EventCancelled',
    }[Number(status?.id ?? status)] ?? 'EventScheduled'
  );
}

// The ticketing summary OpenAgenda computes on each read (`offersAggregate`),
// mapped to the three availability values Google reads on an event ticket:
// InStock, SoldOut, PreOrder. `limited` still has tickets, so it is InStock.
// Every other answer has no honest equivalent and leaves `availability` out:
// `notYetOnSale` is not a preorder (Google: omit it until the sale opens),
// `salesClosed` is not sold out, and `mixed` / `unknown` say the dates or the
// sources disagree. A Map, so that an unexpected value such as `constructor`
// cannot resolve to something inherited.
const TICKETING_AVAILABILITY = new Map([
  ['available', 'InStock'],
  ['limited', 'InStock'],
  ['soldOut', 'SoldOut'],
]);

// The statuses a resolved row may carry. A row outside them is not a row,
// which is how the event page reads them too (`isRow` in packages/next).
const ROW_STATUSES = new Set([
  'available',
  'limited',
  'soldOut',
  'notYetOnSale',
  'salesClosed',
  'unknown',
]);

const SELLING = new Set(['available', 'limited']);

// Event status ids (`status` in the event schema).
const FULL = 5;
const CANCELLED = 6;

function getRegistrationLink(event) {
  return event.registration?.find((r) => r.type === 'link')?.value;
}

// `status` arrives as an id, a numeric string, or `{ id, label }`; the server
// compares it the same way (`Number(value) === expected`).
const statusIs = (event, expected) =>
  Number(event.status?.id ?? event.status) === expected;

// `now` is an instant: epoch milliseconds or a Date, the current time when
// absent. Anything else is a caller's mistake, and guessing would date every
// offer wrongly.
function toNow(now) {
  if (now === undefined || now === null) {
    return Date.now();
  }

  const ms = now instanceof Date ? now.getTime() : now;

  if (typeof ms !== 'number' || Number.isNaN(ms)) {
    throw new TypeError(
      'toEventSchema: `now` must be epoch milliseconds or a Date',
    );
  }

  return ms;
}

// The parser the server's own summary uses. The read always serves an end
// with its offset; an end that cannot be read leaves the date counted, as the
// summary does: dropping a date silently is the harder failure to notice.
function isPast(timing, now) {
  if (typeof timing.end === 'number') {
    return timing.end < now;
  }

  try {
    const end = toInstant(timing.end);

    return end !== null && end < now;
  } catch {
    return false;
  }
}

const rowsOf = (timing) =>
  (Array.isArray(timing.availability) ? timing.availability : []).filter(
    (row) => row && typeof row === 'object' && ROW_STATUSES.has(row.status),
  );

// One date's own rows, already resolved by the read, rolled up the way the
// event page rolls them up: one source with tickets is enough, sold out needs
// them all.
function rowsAvailability(rows) {
  if (rows.some((row) => SELLING.has(row.status))) {
    return 'InStock';
  }

  if (rows.length && rows.every((row) => row.status === 'soldOut')) {
    return 'SoldOut';
  }

  return undefined;
}

// A schema describing ONE date (`timing`, passed by the caller) speaks from
// that date's rows only: no rows, nothing said — never the event summary,
// whose `available` means "some date has tickets", true of the event and
// false of a given date. Without `timing`, the schema describes the whole
// event and reads the summary. A full event is sold out either way, even with
// no rows.
function getTicketingAvailability(event, timing) {
  if (statusIs(event, FULL)) {
    return 'SoldOut';
  }

  if (timing) {
    return rowsAvailability(rowsOf(timing));
  }

  return TICKETING_AVAILABILITY.get(event.offersAggregate.availability);
}

// The booking page follows whoever sells. On a date: the first source that
// still sells and has a page for it — its page for the date (the read joins
// it onto its row as `bookingUrl`), else its catalogue link; when nothing
// sells, any page the date has; with no row to go on, the catalogue's link
// only when there is a single source, since with several any of them may not
// sell this date. For the whole event, the catalogue's first link: the
// summary does not say which source sells, so with several sources this one
// may not be it.
function getTicketingUrl(event, timing) {
  const { links } = event.offersAggregate;
  const linkOf = (provider) => links?.find((l) => l.provider === provider)?.url;

  if (timing) {
    const rows = rowsOf(timing);
    const selling = rows.filter((row) => SELLING.has(row.status));

    if (selling.length) {
      return selling
        .map((row) => row.bookingUrl ?? linkOf(row.provider))
        .find(Boolean);
    }

    return (
      rows.find((row) => row.bookingUrl)?.bookingUrl
      ?? (links?.length === 1 ? links[0].url : undefined)
    );
  }

  return links?.[0]?.url ?? getRegistrationLink(event);
}

// An event with a ticketing catalogue speaks from it, and only from it: its
// availability is real, so it never falls back to the InStock that an event
// without one is given. `price` is the cheapest way in, which is what Google
// asks for ("the lowest available price"), converted with the currency's own
// exponent since amounts are in minor units. It is the event's: the read
// serves no price per date. A zero that is not a free event is left out,
// because Google reads 0 as free: that zero is the floor of a pay-what-you-want
// tier, or a free tier beside paid ones (a child goes free, an adult pays 15),
// and the summary carries no cheapest PAID price to publish instead.
function getTicketingOffer(event, timing) {
  const { offersAggregate: aggregate } = event;

  const offer = { '@type': 'Offer' };

  const url = getTicketingUrl(event, timing);
  if (url) {
    offer.url = url;
  }

  const { price } = aggregate;
  if (
    price
    && isCurrencyCode(price.currency)
    && Number.isSafeInteger(price.minCents)
    && (price.minCents > 0 || aggregate.pricing === 'free')
  ) {
    offer.price = Number(toMajor(price.minCents, price.currency));
    offer.priceCurrency = price.currency;
  }

  const availability = getTicketingAvailability(event, timing);
  if (availability) {
    offer.availability = `https://schema.org/${availability}`;
  }

  return Object.keys(offer).length > 1 ? offer : null;
}

// A cancelled event offers nothing: no price, no booking link, no stock. Its
// `eventStatus` already says it is cancelled. Nor does a past date of an event
// with a catalogue: there is nothing left to buy for it, as the event summary
// itself leaves past dates out. An event without one keeps the offer it always
// had, past dates included.
function getOffer(event, timing, now) {
  if (statusIs(event, CANCELLED)) {
    return null;
  }

  if (event.offersAggregate) {
    return timing && isPast(timing, now)
      ? null
      : getTicketingOffer(event, timing);
  }

  const url = getRegistrationLink(event);

  return url
    ? {
      '@type': 'Offer',
      url,
      availability: `https://schema.org/${statusIs(event, FULL) ? 'SoldOut' : 'InStock'}`,
    }
    : null;
}

function imageToUrl(image, type) {
  if (!image) return;

  const variant = typeof type === 'string'
    ? (image.variants?.find((img) => img.type === type) ?? image)
    : image;

  return `${image.base}${variant.filename}`;
}

// `timing`, when given, makes the schema describe that one date of the event
// (its dates, its availability, its booking page) rather than the whole event.
// `now` (epoch milliseconds or a Date) is the instant a date is judged past
// against.
export default function toEventSchema(
  event,
  { url, locale, defaultLocale = DEFAULT_LANG, formatDate, timing, now },
) {
  const timings = timing ? [timing] : event.timings;

  const { begin } = timings[0];
  const { end } = timings.at(-1);

  const timezone = event.timezone || event.location?.timezone;

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: getLocaleValue(event.title, locale, defaultLocale),
    description: getLocaleValue(event.description, locale, defaultLocale),
    startDate: formatDate(begin, timezone),
    endDate: formatDate(end, timezone),
    eventAttendanceMode: `https://schema.org/${getEventAttendanceMode(event.attendanceMode)}`,
    eventStatus: `https://schema.org/${getEventStatus(event.status)}`,
  };

  const offer = getOffer(event, timing, toNow(now));
  if (offer) {
    eventSchema.offers = offer;
  }

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
