// v3 events facets: request parsing + result mapping for the faceted-counts
// endpoint (`GET /agendas/:agendaUid/events/facets`).
//
// Facets are the aggregations event-search already computes
// (packages/event-search/aggregations/index.js). They come in several result
// SHAPES, so each facet is registered with a mapper for the WHOLE aggregation
// result (not per-bucket — `viewport` is a single object, not a list):
//   - term facets       -> [{ value, count }]                 (FacetBucket)
//   - provenance facets  -> [{ agenda, count }]               (Agenda*FacetBucket)
//   - geohash            -> [{ value, count, latitude, longitude }] (GeoFacetBucket)
//   - viewport           -> { topLeft, bottomRight } | null    (Viewport)
//   - timespan           -> { first, last } | null             (Timespan)
//   - timings            -> [{ value, count }]                 (FacetBucket)
//   - dateRanges         -> [{ value, count }]                 (FacetBucket)
// The additionalFields family lands in a later sub-tranche.
//
// Each facet name maps 1:1 to an event-search aggregation type, so the name is
// passed straight through as the requested aggregation (geohash carries a
// `zoom` option; timings an `interval`; dateRanges a date `window` via the
// query). Moderation/internal aggregations (members, valid, states,
// addMethods, adminLevels) are absent — unreachable from v3, mirroring the
// filter/sort curation of tranche 4.

import { BadRequest } from '@openagenda/verror';
import { cleanAgendaRef } from './mapEvent.js';

// --- per-facet result mappers (input: the raw aggregation result for the facet)

// Term buckets: internally { key, eventCount }. `value` is stringified (some
// facets key on integers, e.g. status) so the term-facet shape stays uniform.
const mapTerms = (r) =>
  (r ?? []).map((b) => ({
    value: String(b.key),
    count: b.eventCount,
  }));

// Provenance buckets: internally { key, agenda, eventCount }. Emit the agenda as
// the same AgendaRef shape events use (allowlist-cleaned); it naturally yields
// {uid,title,image} for sources (their _agg packs only those) and the full ref
// for origins. The uid feeds the originAgendaUid/sourceAgendaUid filters.
const mapAgendas = (r) =>
  (r ?? []).map((b) => ({
    agenda: cleanAgendaRef(b.agenda),
    count: b.eventCount,
  }));

// Geohash clusters: internally { key, eventCount, latitude, longitude }.
const mapGeohash = (r) =>
  (r ?? []).map((b) => ({
    value: b.key,
    count: b.eventCount,
    latitude: b.latitude,
    longitude: b.longitude,
  }));

// Viewport: internally already { topLeft:{latitude,longitude}, bottomRight:{…} }
// or null (no event with coordinates). Pass through.
const mapViewport = (r) => r ?? null;

// Normalize an aggregation date (event-search returns Date objects; be lenient
// about strings) to an RFC 3339 string, or null when absent/invalid.
const toIso = (d) => {
  if (d == null) {
    return null;
  }
  const date = d instanceof Date ? d : new Date(d);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

// Timespan: internally { first: Date, last: Date }. Over an empty set the
// min/max are absent (Invalid Date), so the whole facet collapses to null —
// same "no data" convention as viewport.
const mapTimespan = (r) => {
  const first = toIso(r?.first);
  const last = toIso(r?.last);
  if (first === null || last === null) {
    return null;
  }
  return { first, last };
};

// Timings histogram: internally [{ key, timingCount }] where key is the
// interval-formatted bucket label. Emit the uniform term-facet shape.
const mapTimings = (r) =>
  (r ?? []).map((b) => ({
    value: b.key,
    count: b.timingCount,
  }));

// Date-range grid: internally [{ key, eventCount, sampleEvents }] — one bucket
// per day across the window, including zero-count days. We expose only the dense
// daily count grid (uniform term-facet shape); `sampleEvents` (raw ES `_source`
// that bypasses the search projection) is intentionally dropped. `value` is the
// day key (yyyy-MM-dd).
const mapDateRanges = (r) =>
  (r ?? []).map((b) => ({
    value: b.key,
    count: b.eventCount,
  }));

// Public facet registry: name -> result mapper. The key set is the allow-list.
const FACETS = {
  cities: mapTerms,
  regions: mapTerms,
  departments: mapTerms,
  districts: mapTerms,
  countryCodes: mapTerms,
  keywords: mapTerms,
  languages: mapTerms,
  accessibilities: mapTerms,
  status: mapTerms,
  attendanceModes: mapTerms,
  originAgendas: mapAgendas,
  sourceAgendas: mapAgendas,
  geohash: mapGeohash,
  viewport: mapViewport,
  timespan: mapTimespan,
  timings: mapTimings,
  dateRanges: mapDateRanges,
};

const ALLOWED = new Set(Object.keys(FACETS));

// Parse the CSV `facets` param into a validated, de-duplicated list. Required
// (>= 1) and strictly validated — an unknown facet is a 400 with per-field
// context, exactly like the list filters. Accepts the documented CSV form
// (`facets=cities,keywords`) and, defensively, repeated params.
export function parseFacets(rawFacets) {
  const requested = []
    .concat(rawFacets ?? [])
    .flatMap((part) => String(part).split(','))
    .map((s) => s.trim())
    .filter(Boolean);

  const errors = [];
  if (!requested.length) {
    errors.push({
      field: 'facets',
      message: 'facets is required (at least one)',
    });
  }
  for (const name of requested) {
    if (!ALLOWED.has(name)) {
      errors.push({ field: 'facets', message: `unknown facet "${name}"` });
    }
  }
  if (errors.length) {
    throw new BadRequest({ info: { errors } }, 'Invalid query parameters');
  }

  return [...new Set(requested)];
}

// Clustering zoom for the geohash facet. Lenient like `limit` (clamp, no 400):
// default 1, floored at 1. Only consumed when geohash is requested.
export function parseGeohashZoom(rawZoom) {
  if (rawZoom === undefined) {
    return 1;
  }
  const value = parseInt(rawZoom, 10);
  if (Number.isNaN(value)) {
    return 1;
  }
  return Math.max(1, value);
}

// Bucketing interval for the timings histogram, and the date format that keeps
// each bucket key distinct at that granularity (the underlying aggregation
// defaults to a daily format, which would collapse hourly buckets and pad
// monthly/yearly ones — so the format tracks the interval).
const TIMINGS_INTERVALS = {
  hour: 'YYYY-MM-dd HH:mm',
  day: 'YYYY-MM-dd',
  week: 'YYYY-MM-dd',
  month: 'YYYY-MM',
  year: 'YYYY',
};
const DEFAULT_TIMINGS_INTERVAL = 'day';

// Interval for the timings facet. Lenient like `geohashZoom` (fall back to the
// default, no 400): an unknown value yields daily buckets. Only consumed when
// timings is requested.
export function parseTimingsInterval(rawInterval) {
  return Object.prototype.hasOwnProperty.call(TIMINGS_INTERVALS, rawInterval)
    ? rawInterval
    : DEFAULT_TIMINGS_INTERVAL;
}

const MONTH_RE = /^(\d{4})-(\d{2})$/;

// Date window (one calendar month) for the dateRanges facet, from a `YYYY-MM`
// param. Lenient like the other facet options: absent/invalid → null, and the
// aggregation falls back to its own default (the current month). Only consumed
// when dateRanges is requested. Bounded to a single month by construction, so
// the per-day bucket list can never blow up. Returned as `{ gte, lte }` Dates,
// which the aggregation reads for its bucket bounds (and which the search turns
// into a timings filter, scoping the facet set to the month — consistent with
// "all facets over the same filtered set").
export function parseMonthWindow(rawMonth) {
  if (typeof rawMonth !== 'string') {
    return null;
  }
  const m = MONTH_RE.exec(rawMonth);
  if (!m) {
    return null;
  }
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) {
    return null;
  }
  return {
    gte: new Date(year, month - 1, 1),
    lte: new Date(year, month, 0),
  };
}

// Build the `aggregations` request for core from the facet names. Most facets
// are passed as their bare name (type === key); geohash carries its `zoom`
// option and timings its `interval`/`format` as an object request. dateRanges
// maps the public name to the `eventsByDateRanges` aggregation (its window comes
// from `query.date`, set by the route, not from here).
export function buildAggregations(
  facets,
  { geohashZoom, timingsInterval } = {},
) {
  return facets.map((name) => {
    if (name === 'geohash') {
      return { type: 'geohash', zoom: geohashZoom };
    }
    if (name === 'timings') {
      return {
        type: 'timings',
        interval: timingsInterval,
        format: TIMINGS_INTERVALS[timingsInterval],
      };
    }
    if (name === 'dateRanges') {
      return { type: 'eventsByDateRanges', key: 'dateRanges' };
    }
    return name;
  });
}

// Map core's aggregation results to the public `{ facets: { <name>: … } }`
// shape, each facet through its registered mapper. Only requested facets are
// emitted.
export function mapFacets(aggregations, facets) {
  const out = {};
  for (const name of facets) {
    out[name] = FACETS[name](aggregations?.[name]);
  }
  return { facets: out };
}
