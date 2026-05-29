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
// Time/custom families land in later sub-tranches.
//
// Each facet name maps 1:1 to an event-search aggregation type, so the name is
// passed straight through as the requested aggregation (geohash also carries a
// `zoom` option). Moderation/internal aggregations (members, valid, states,
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

// Build the `aggregations` request for core from the facet names. Most facets
// are passed as their bare name (type === key); geohash carries its `zoom`
// option as an object request.
export function buildAggregations(facets, { geohashZoom } = {}) {
  return facets.map((name) =>
    (name === 'geohash' ? { type: 'geohash', zoom: geohashZoom } : name));
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
