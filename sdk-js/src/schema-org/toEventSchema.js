import { getLocaleValue, DEFAULT_LANG } from '@openagenda/intl';
import { isCurrencyCode, toMajor } from '@openagenda/utils/iso4217';
import { toInstant } from '@openagenda/utils/isoDatetime';

function getEventAttendanceMode(attendanceMode) {
  return (
    {
      1: 'OfflineEventAttendanceMode',
      2: 'OnlineEventAttendanceMode',
      3: 'MixedEventAttendanceMode',
    }[attendanceMode?.id ?? attendanceMode] ?? 'OfflineEventAttendanceMode'
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
    }[status?.id ?? status] ?? 'EventScheduled'
  );
}

// The ticketing summary OpenAgenda computes on each read (`offersAggregate`),
// mapped to the three availability values Google reads on an event ticket:
// InStock, SoldOut, PreOrder. `limited` still has tickets, so it is InStock.
// Every other answer has no honest equivalent and leaves `availability` out:
// `notYetOnSale` is not a preorder (Google: omit it until the sale opens),
// `salesClosed` is not sold out, and `mixed` / `unknown` say the dates or the
// sources disagree.
const TICKETING_AVAILABILITY = {
  available: 'InStock',
  limited: 'InStock',
  soldOut: 'SoldOut',
};

// Event status ids (`status` in the event schema).
const FULL = 5;
const CANCELLED = 6;

const SELLING = new Set(['available', 'limited']);

function getRegistrationLink(event) {
  return event.registration?.find((r) => r.type === 'link')?.value;
}

// `status` arrives as an id or as `{ id, label }`, as everywhere in this file.
const statusOf = (event) => event.status?.id ?? event.status;

// The parser the server's own summary uses. An end it cannot read leaves the
// date counted, as the summary does: dropping a date silently is the harder
// failure to notice.
const isPast = (timing, now) => {
  try {
    const end = toInstant(timing.end);

    return end !== null && end < now;
  } catch {
    return false;
  }
};

// One date's own rows, already resolved by the read, rolled up the way the
// summary rolls dates up: one source with tickets is enough, sold out needs
// them all.
function rowsAvailability(rows) {
  const statuses = rows
    .filter((row) => row && typeof row === 'object')
    .map((row) => row.status);

  if (statuses.some((s) => SELLING.has(s))) {
    return 'InStock';
  }

  if (statuses.length && statuses.every((s) => s === 'soldOut')) {
    return 'SoldOut';
  }

  return undefined;
}

// A schema describing ONE date reads that date's rows. The summary answers for
// the whole event, and its `available` means "some date has tickets": true of
// the event, false of a sold-out date, which is what the portal renders when
// it emits one schema per timing. A past date has nothing left to sell, as the
// summary itself leaves past dates out. A full event is sold out whatever the
// rows say, even when there are none.
function getTicketingAvailability(event, now) {
  const { timings, offersAggregate: aggregate } = event;
  const date = timings.length === 1 ? timings[0] : null;

  if (date && isPast(date, now)) {
    return undefined;
  }

  if (statusOf(event) === FULL) {
    return 'SoldOut';
  }

  if (Array.isArray(date?.availability)) {
    return rowsAvailability(date.availability);
  }

  return TICKETING_AVAILABILITY[aggregate.availability];
}

// The booking page: on a single date, the date's own page when a source sets
// one (the read joins it onto that source's row as `bookingUrl`), preferring a
// source that still sells; otherwise the first source of the catalogue. A
// cancelled event keeps no booking link: the read withdraws the catalogue's,
// and the organiser's would sell a show that no longer takes place.
function getTicketingUrl(event) {
  const { timings, offersAggregate: aggregate } = event;
  const rows = timings.length === 1 && Array.isArray(timings[0].availability)
    ? timings[0].availability.filter((row) => row?.bookingUrl)
    : [];

  return (
    rows.find((row) => SELLING.has(row.status))?.bookingUrl
    ?? rows[0]?.bookingUrl
    ?? aggregate.links?.[0]?.url
    ?? (statusOf(event) === CANCELLED ? undefined : getRegistrationLink(event))
  );
}

// An event with a ticketing catalogue speaks from it, and only from it: its
// availability is real, so it never falls back to the InStock that an event
// without one is given. `price` is the cheapest way in, which is what Google
// asks for ("the lowest available price"), converted with the currency's own
// exponent since amounts are in minor units. It is the event's: the read
// serves no price per date. A zero that is not a free event — the floor of a
// pay-what-you-want tier — is left out, since Google reads 0 as free.
function getTicketingOffer(event, now) {
  const { offersAggregate: aggregate } = event;

  const offer = { '@type': 'Offer' };

  const url = getTicketingUrl(event);
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

  const availability = getTicketingAvailability(event, now);
  if (availability) {
    offer.availability = `https://schema.org/${availability}`;
  }

  return Object.keys(offer).length > 1 ? offer : null;
}

function getOffer(event, now) {
  if (event.offersAggregate) {
    return getTicketingOffer(event, now);
  }

  const url = getRegistrationLink(event);

  return url
    ? {
      '@type': 'Offer',
      url,
      availability: `https://schema.org/${statusOf(event) === FULL ? 'SoldOut' : 'InStock'}`,
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

export default function toEventSchema(
  event,
  { url, locale, defaultLocale = DEFAULT_LANG, formatDate, now = Date.now() },
) {
  const { timings } = event;

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

  const offer = getOffer(event, now);
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
