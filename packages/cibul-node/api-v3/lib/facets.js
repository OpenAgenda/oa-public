// v3 events facets: request parsing + result mapping for the faceted-counts
// endpoint (`GET /agendas/:agendaUid/events/facets`).
//
// Facets are the aggregations event-search already computes
// (packages/event-search/aggregations/index.js). They fall into several bucket
// SHAPES, so each facet is registered here with the mapper for its shape:
//   - term facets      -> { value, count }            (FacetBucket)
//   - provenance facets -> { agenda: {uid,title}, count } (AgendaFacetBucket)
// Geo/time/custom families (distinct shapes again) land in later sub-tranches.
//
// Each facet name maps 1:1 to an event-search aggregation type, so the name is
// passed straight through as the requested aggregation. Moderation/internal
// aggregations (members, valid, states, addMethods, adminLevels) are absent —
// unreachable from v3, mirroring the filter/sort curation of tranche 4.

import { BadRequest } from '@openagenda/verror';
import { cleanAgendaRef } from './mapEvent.js';

// Term bucket: internally { key, eventCount }. `value` is stringified (some
// facets key on integers, e.g. status) so the term-facet shape stays uniform.
const mapTermBucket = (b) => ({ value: String(b.key), count: b.eventCount });

// Provenance bucket: internally { key, agenda, eventCount }. Emit the agenda as
// the same AgendaRef shape events use (uid, title, slug, image, url — allowlist
// cleaned). The uid feeds the originAgendaUid/sourceAgendaUid filters. Note the
// index packs slug/url for origin agendas only; source refs carry uid/title/
// image, so cleanAgendaRef simply omits the absent fields (AgendaRef requires
// none).
const mapAgendaBucket = (b) => ({
  agenda: cleanAgendaRef(b.agenda),
  count: b.eventCount,
});

// Public facet registry: name -> bucket mapper. The key set is the allow-list.
const FACETS = {
  cities: mapTermBucket,
  regions: mapTermBucket,
  departments: mapTermBucket,
  districts: mapTermBucket,
  countryCodes: mapTermBucket,
  keywords: mapTermBucket,
  languages: mapTermBucket,
  accessibilities: mapTermBucket,
  status: mapTermBucket,
  attendanceModes: mapTermBucket,
  originAgendas: mapAgendaBucket,
  sourceAgendas: mapAgendaBucket,
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

// Map core's aggregation results to the public `{ facets: { <name>: [...] } }`
// shape, each facet through its registered mapper. Only requested facets are
// emitted; a facet with no buckets yields `[]`.
export function mapFacets(aggregations, facets) {
  const out = {};
  for (const name of facets) {
    const buckets = aggregations?.[name] ?? [];
    out[name] = buckets.map(FACETS[name]);
  }
  return { facets: out };
}
