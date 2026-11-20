import { getLocaleValue, DEFAULT_LANG } from '@openagenda/intl';
import { isCurrencyCode, toMajor } from '@openagenda/utils/iso4217';
import { httpUrl, providerBookingUrl, rowBookingUrl } from './bookingLinks.js';
import { isPast, toNow } from './timings.js';
import { CANCELLED, FULL, statusIs } from './eventStatus.js';

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

// The first registration link worth linking to: an absolute http(s) URL,
// like every booking link. A link the page cannot vouch for is left out: the
// write cleans links into that shape, and guessing a scheme for the rest turns
// a relative path or a phone number into an address Google would follow.
function getRegistrationLink(event, excluded = new Set()) {
  return event.registration
    ?.filter((r) => r?.type === 'link' && !excluded.has(r.value))
    .map((r) => httpUrl(r.value))
    .find(Boolean);
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

// The organiser's own registration link: the first one that is not a
// catalogue link. The read appends each ticketing source's link to
// `registration` after the stored entries, so the first link of an event
// without one of its own is a source's, which may not sell a given date.
function getOwnRegistrationLink(event) {
  return getRegistrationLink(
    event,
    new Set((event.offersAggregate?.links ?? []).map((link) => link?.url)),
  );
}

// The booking page follows whoever sells, by the rule the event page applies
// (`rowBookingUrl`: the date's own page, else the provider's catalogue link
// unless it sells through two shops). On a date: the first selling row with a
// link; when nothing sells, the first row with one; with no row to go on, the
// catalogue's link only when there is a single source, since with several any
// of them may not sell this date. Last, the organiser's own registration link,
// which holds for every date. For the whole event, the first catalogue link
// the event page would give too: the summary does not say which source sells,
// so with several sources this one may not be it.
// The catalogue's link when every source points at the same shop.
function soleShopUrl(links) {
  const urls = (Array.isArray(links) ? links : [])
    .map((link) => httpUrl(link?.url))
    .filter(Boolean);

  return urls.length && new Set(urls.map((url) => new URL(url).href)).size === 1
    ? urls[0]
    : null;
}

function getTicketingUrl(event, timing) {
  const { links } = event.offersAggregate;

  if (timing) {
    const rows = rowsOf(timing);
    const selling = rows.filter((row) => SELLING.has(row.status));

    // With no row, "a single source" is a single shop: the same URL listed
    // twice by two sources is one.
    const fromRows = rows.length
      ? (selling.length ? selling : rows)
        .map((row) => rowBookingUrl(row, links)?.url)
        .find(Boolean)
      : soleShopUrl(links);

    return fromRows ?? getOwnRegistrationLink(event);
  }

  // The first source's link the event page would give too: not one of a
  // provider's two shops. Then the organiser's own link, never a source's the
  // read appended to `registration`, for the same reason.
  const first = Array.isArray(links)
    ? links
      .map((link) => providerBookingUrl(links, link?.provider))
      .find(Boolean)
    : null;

  return first ?? getOwnRegistrationLink(event);
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

// An image address, absolute: a protocol-relative one (`//cdn…`) is read as
// https, the only scheme the CDN serves.
const imageUrl = (value) =>
  (typeof value === 'string' && value.startsWith('//')
    ? httpUrl(`https:${value}`)
    : httpUrl(value));

function imageToUrl(image) {
  if (!image) return;

  // Some reads still serve the image as a plain URL.
  if (typeof image === 'string') {
    return imageUrl(image) ?? undefined;
  }

  // The responsive shape (`includeResponsiveImage`, which the event page asks
  // for) carries a ready rendition as `src` and no `base` / `filename`.
  const src = imageUrl(image.src);
  if (src) {
    return src;
  }

  if (typeof image.base !== 'string' || typeof image.filename !== 'string') {
    return;
  }

  return imageUrl(`${image.base}${image.filename}`) ?? undefined;
}

// `timing`, when given, makes the schema describe that one date of the event
// (its dates, its availability, its booking page) rather than the whole event.
// `now` (epoch milliseconds or a Date) is the instant a date is judged past
// against.
export default function toEventSchema(
  event,
  {
    url,
    locale,
    defaultLocale = DEFAULT_LANG,
    formatDate,
    // Defaults spelled out: TypeScript callers infer this signature from the
    // destructuring, and an option without one reads as required.
    timing = undefined,
    now = undefined,
  },
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

  const image = imageToUrl(event.image);
  if (image) {
    eventSchema.image = image;
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
