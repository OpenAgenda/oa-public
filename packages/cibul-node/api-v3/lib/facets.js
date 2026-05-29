// v3 events facets: request parsing + result mapping for the faceted-counts
// endpoint (`GET /agendas/:agendaUid/events/facets`).
//
// v1 exposes TERM facets only — uniform `{ value, count }` buckets. Other
// aggregation families (geo, time, provenance, custom fields) have distinct
// shapes and land in later sub-tranches.

import { BadRequest } from '@openagenda/verror';

// Public term facets. Each name maps 1:1 to an event-search aggregation type
// (packages/event-search/aggregations/index.js), so it is passed straight
// through as the requested aggregation. Moderation/internal aggregations
// (members, valid, states, addMethods, adminLevels) are deliberately absent —
// unreachable from v3, mirroring the filter/sort curation of tranche 4.
export const TERMS_FACETS = [
  'cities',
  'regions',
  'departments',
  'districts',
  'countryCodes',
  'keywords',
  'languages',
  'accessibilities',
  'status',
  'attendanceModes',
];

const ALLOWED = new Set(TERMS_FACETS);

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

// Map core's aggregation results to the public
// `{ facets: { <name>: [{ value, count }] } }` shape. Term buckets are
// internally `{ key, eventCount }`; `value` is stringified (some facets key on
// integers, e.g. `status`) so the contract stays uniform. Only requested
// facets are emitted; a facet with no buckets yields `[]`.
export function mapFacets(aggregations, facets) {
  const out = {};
  for (const name of facets) {
    const buckets = aggregations?.[name] ?? [];
    out[name] = buckets.map((b) => ({
      value: String(b.key),
      count: b.eventCount,
    }));
  }
  return { facets: out };
}
