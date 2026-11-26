import toEventSchema from './toEventSchema.js';
import { instantOf, toNow } from './timings.js';
import { POSTPONED, statusIs } from './eventStatus.js';

// How many dates a page describes. Each one is a full `Event` (title,
// description, place, offer), about 1.2 kB of JSON for a typical event, so a
// daily exhibition open for a year would otherwise put some 440 kB of markup
// in its page; twenty dates stay near 25 kB. Twenty covers three weeks of daily
// dates or a season of weekly ones; later dates enter as earlier ones pass,
// each time the page is rendered again.
export const EVENT_GRAPH_MAX_TIMINGS = 20;

// `limit` only lowers the cap: a whole number from 1 to the cap. Anything else
// is a caller's mistake, refused rather than read as "nothing" (0, -1, NaN
// left the page without markup, silently) or as "everything" (Infinity).
function toLimit(limit) {
  if (limit === undefined) {
    return EVENT_GRAPH_MAX_TIMINGS;
  }

  if (
    !Number.isInteger(limit)
    || limit < 1
    || limit > EVENT_GRAPH_MAX_TIMINGS
  ) {
    throw new TypeError(
      `toEventGraph: \`limit\` must be a whole number from 1 to ${EVENT_GRAPH_MAX_TIMINGS}`,
    );
  }

  return limit;
}

// The dates whose two bounds are instants, each with them read once, soonest
// first.
//
// ONLY DATES WHOSE TWO BOUNDS ARE INSTANTS, and here that is the opposite of
// `isPast`, which keeps an unreadable date counted. A date this markup cannot
// place in time has no `startDate` to give: formatting it throws, which on a
// server-rendered page takes the page down with it, and a bound without an
// offset could never be judged past, so it would stay "to come" for good.
function placedTimings(timings) {
  if (!Array.isArray(timings)) {
    return [];
  }

  return timings
    .filter((timing) => timing && typeof timing === 'object')
    .map((timing) => ({
      timing,
      begin: instantOf(timing.begin),
      end: instantOf(timing.end),
    }))
    .filter(({ begin, end }) => begin !== null && end !== null)
    .sort((a, b) => a.begin - b.begin);
}

// The dates still to come, soonest first, at most `limit` of them. A date in
// progress is still to come: its end is not past.
const upcomingOf = (placed, now, limit) =>
  placed.filter(({ end }) => end >= now).slice(0, limit);

export function upcomingTimings(timings, { now, limit } = {}) {
  return upcomingOf(placedTimings(timings), toNow(now), toLimit(limit)).map(
    ({ timing }) => timing,
  );
}

// What tells one date's node from the next on the same page: its begin, as a
// UTC instant. The dates of an event do not share one, since a write refuses
// overlapping dates; the begin rather than the date's id, which the read
// serves for some dates and not others, so one page would mix two schemes and
// a node's `@id` would change the day its date gains an id.
//
// Unique whatever the data: a date stored before the overlap check, sharing
// its begin with another, would otherwise give two nodes the same `@id`, the
// merge this file exists to prevent. A repeated key takes the date's end, and
// only when that is not enough either, its rank, which no other key can carry.
// Uniqueness is all this buys: on such data a node's key can still change
// from one render to the next, as the date ahead of it passes.
function uniqueKeys(placed) {
  const seen = new Set();

  return placed.map(({ begin, end }, index) => {
    const beginKey = new Date(begin).toISOString();
    let key = beginKey;

    if (seen.has(key)) {
      key = `${beginKey}/${new Date(end).toISOString()}`;
    }

    if (seen.has(key)) {
      key = `${key}-${index}`;
    }

    seen.add(key);

    return key;
  });
}

// The dates a page describes: those still to come, at most `limit`. A
// postponed event with none left keeps its last date: Google asks to "keep the
// original date in the startDate of the event until you know when the event
// will take place", with the status saying it is postponed. Any other event
// with no date left has nothing to put forward.
function describedTimings(event, now, limit) {
  const placed = placedTimings(event?.timings);
  const upcoming = upcomingOf(placed, now, limit);

  if (upcoming.length || !statusIs(event, POSTPONED) || !placed.length) {
    return upcoming;
  }

  // The date that ends last: with legacy overlapping dates, the latest begin
  // may end before another.
  return [placed.reduce((last, date) => (date.end >= last.end ? date : last))];
}

// One `Event` per date still to come, gathered in a `@graph`: Google asks for
// "a separate Event element for each performance" when performances fall on
// different days with their own tickets, and a run of dates squeezed into a
// single Event reads as one event lasting from the first to the last. A single
// date, however long (a festival), is one node.
//
// Every node is built by `toEventSchema` with its date as `timing`, so each
// reads that date's own availability and booking page, and a date without
// rows of its own claims no availability rather than the event summary's. They
// share the page's `url`, and each gets its own `@id` under it: nodes with the
// same `@id` are one and the same node to a JSON-LD reader, which would merge
// every date back into a single event.
//
// Null when no date is left to come, a postponed event aside (see
// `describedTimings`): the event as a whole, from its first date to its last,
// is the misleading shape this function replaces.
export default function toEventGraph(event, options = {}) {
  const { now: rawNow, limit, ...schemaOptions } = options;
  // One instant for every node, read the way toEventSchema reads it.
  const now = toNow(rawNow);
  const { url } = schemaOptions;

  const described = describedTimings(event, now, toLimit(limit));
  const postponed = statusIs(event, POSTPONED);
  const keys = uniqueKeys(described);

  const nodes = described.map(({ timing, begin, end }, index) => {
    // The bounds as the instants read above, in UTC ISO form, so the date
    // formatted is the date judged: a form `toInstant` reads (a lower-case
    // `z`) may not be one the caller's formatter reads the same way.
    const { '@context': context, ...node } = toEventSchema(event, {
      ...schemaOptions,
      timing: {
        ...timing,
        begin: new Date(begin).toISOString(),
        end: new Date(end).toISOString(),
      },
      now,
    });

    // A postponed event sells nothing on any of its dates: whatever the
    // tickets were for, the dates it names are not when it will take place.
    if (postponed) {
      delete node.offers;
    }

    return url ? { ...node, '@id': `${url}#${keys[index]}` } : node;
  });

  return nodes.length
    ? { '@context': 'https://schema.org', '@graph': nodes }
    : null;
}
