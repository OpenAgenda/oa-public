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
//   - additionalFields   -> { <field>: { label, values:[{value,label,count}] } }
//   - additionalFieldMetrics -> { <field>: { label, metrics:{sum,avg,max,min} } }
//
// Simple facets map 1:1 to an event-search aggregation type (geohash carries a
// `zoom` option; timings an `interval`; dateRanges a date `window` via the
// query). The two schema-driven families fan out to one mono-field aggregation
// per agenda field and are access-gated up front (see the schema-driven section
// below). Moderation/internal aggregations (members, valid, states, addMethods,
// adminLevels) are absent — unreachable from v3, mirroring the filter/sort
// curation of tranche 4.

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

// The two schema-driven families are not in the simple `FACETS` registry (they
// fan out to one aggregation per agenda field and need the access-filtered
// schema, resolved by the route). They are allow-listed here and handled
// specially in buildAggregations/mapFacets.
const SCHEMA_FACETS = new Set(['additionalFields', 'additionalFieldMetrics']);

const ALLOWED = new Set([...Object.keys(FACETS), ...SCHEMA_FACETS]);

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

// --- schema-driven families (additionalFields / additionalFieldMetrics) ------
//
// Both fan out to ONE mono-field aggregation per agenda field, keyed
// `<facet>:<field>`, and are access-gated UP FRONT: the route resolves the
// caller's access-filtered schema (settings.schema.getMerged({access})) and
// `resolveAdditionalFieldSelections` only ever selects fields present there, so
// a restricted field is NEVER aggregated (the safety is structural, not a
// post-filter). The aggregation's own lack of read-access awareness is moot.

// Agenda fields the option-count facet applies to (choice/boolean families that
// feed `_search_additional_keywords`) and the numeric families the metrics facet
// applies to (feed `_search_additional_numbers`). Mirrors event-search
// `extractSchemaAdditionalSearchables`.
const OPTIONED_TYPES = new Set([
  'radio',
  'checkbox',
  'select',
  'multiselect',
  'boolean',
]);
const NUMERIC_TYPES = new Set(['number', 'integer']);
const METRICS = ['sum', 'avg', 'max', 'min'];

// Agenda-specific (custom) fields carry a non-null `schemaId`; native fields
// don't. Mirrors event-search `getFormSchemaAdditionalFields`.
const additionalFieldsOf = (schema) =>
  (schema?.fields ?? []).filter(
    (f) => f.schemaId !== undefined && f.schemaId !== null,
  );

// Per-field read access. A field with no/empty `read` is public; otherwise the
// caller's access level must be listed. Same rule as event-search
// `defineIncludes` / form-schemas `filterByAccess`. THIS is the security gate:
// `settings.schema.getMerged({access})` does NOT drop restricted additional
// fields, so v3 must filter them out before aggregating (a `pk` caller resolves
// to `'public'`, so only public-readable fields are ever aggregated).
// Exported: the events/schema route applies the same per-field gate to the
// raw merged schema it serves.
export const isReadableAt = (field, access) =>
  !field.read?.length || field.read.includes(access);

// Parse a CSV field-list param. Absent → null (= "all readable of this type");
// otherwise a de-duplicated list of names.
export function parseFieldKeys(raw) {
  if (raw === undefined) {
    return null;
  }
  return [
    ...new Set(
      []
        .concat(raw)
        .flatMap((part) => String(part).split(','))
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}

function selectFields(eligible, requestedKeys, paramName, errors) {
  if (requestedKeys === null) {
    return eligible;
  }
  const byName = new Map(eligible.map((f) => [f.field, f]));
  const selected = [];
  for (const key of requestedKeys) {
    const field = byName.get(key);
    if (!field) {
      // Unknown, wrong-typed, OR not readable at this access — all reported the
      // same way so a restricted field's existence is not revealed.
      errors.push({
        field: paramName,
        message: `unknown additional field "${key}"`,
      });
      continue;
    }
    selected.push(field);
  }
  return selected;
}

// Resolve which agenda fields each schema-driven facet runs on. Filters the
// merged schema's additional fields down to those READABLE at the caller's
// `access` (the gate getMerged doesn't apply), then by family type. Throws a
// 400 listing every bad field name.
export function resolveAdditionalFieldSelections(
  schema,
  { countsKeys, metricsKeys, wantCounts, wantMetrics, access },
) {
  const readable = additionalFieldsOf(schema).filter((f) =>
    isReadableAt(f, access));
  const errors = [];
  const selections = { additionalFields: [], additionalFieldMetrics: [] };

  if (wantCounts) {
    const eligible = readable.filter((f) => OPTIONED_TYPES.has(f.fieldType));
    selections.additionalFields = selectFields(
      eligible,
      countsKeys,
      'additionalFieldsKeys',
      errors,
    ).map((f) => ({ field: f.field, label: f.label }));
  }

  if (wantMetrics) {
    const eligible = readable.filter((f) => NUMERIC_TYPES.has(f.fieldType));
    selections.additionalFieldMetrics = selectFields(
      eligible,
      metricsKeys,
      'additionalFieldMetricsKeys',
      errors,
    ).map((f) => ({ field: f.field, label: f.label }));
  }

  if (errors.length) {
    throw new BadRequest({ info: { errors } }, 'Invalid query parameters');
  }

  return selections;
}

// Build the `aggregations` request for core from the facet names. Simple facets
// map to a single entry (bare name, or an object request carrying their option);
// the schema-driven families fan out to one mono-field entry per resolved field.
export function buildAggregations(
  facets,
  { geohashZoom, timingsInterval, afSelections = {} } = {},
) {
  return facets.flatMap((name) => {
    if (name === 'geohash') {
      return [{ type: 'geohash', zoom: geohashZoom }];
    }
    if (name === 'timings') {
      return [
        {
          type: 'timings',
          interval: timingsInterval,
          format: TIMINGS_INTERVALS[timingsInterval],
        },
      ];
    }
    if (name === 'dateRanges') {
      return [{ type: 'eventsByDateRanges', key: 'dateRanges' }];
    }
    if (name === 'additionalFields') {
      return (afSelections.additionalFields ?? []).map((f) => ({
        type: 'additionalFields',
        field: f.field,
        key: `additionalFields:${f.field}`,
      }));
    }
    if (name === 'additionalFieldMetrics') {
      return (afSelections.additionalFieldMetrics ?? []).map((f) => ({
        type: 'additionalFieldMetrics',
        field: f.field,
        metrics: METRICS,
        key: `additionalFieldMetrics:${f.field}`,
      }));
    }
    return [name];
  });
}

// additionalFields buckets per field: internally [{ ...option, eventCount }]
// (the option already carries its localized `label`; booleans carry `key`
// 'true'/'false' and no label).
function mapAdditionalFields(aggregations, selection) {
  const out = {};
  for (const { field, label } of selection) {
    const values = aggregations?.[`additionalFields:${field}`] ?? [];
    out[field] = {
      label: label ?? {},
      values: values.map((opt) => ({
        value: String(opt.id ?? opt.key),
        label: opt.label ?? null,
        count: opt.eventCount,
      })),
    };
  }
  return out;
}

// additionalFieldMetrics per field: internally { sum, avg, max, min } (any may
// be null when no event in the set carries a value).
function mapAdditionalFieldMetrics(aggregations, selection) {
  const out = {};
  for (const { field, label } of selection) {
    const m = aggregations?.[`additionalFieldMetrics:${field}`] ?? {};
    out[field] = {
      label: label ?? {},
      metrics: {
        sum: m.sum ?? null,
        avg: m.avg ?? null,
        max: m.max ?? null,
        min: m.min ?? null,
      },
    };
  }
  return out;
}

// Map core's aggregation results to the public `{ facets: { <name>: … } }`
// shape. Simple facets go through their registered mapper; the schema-driven
// families assemble a per-field map from their resolved selection.
export function mapFacets(aggregations, facets, { afSelections = {} } = {}) {
  const out = {};
  for (const name of facets) {
    if (name === 'additionalFields') {
      out.additionalFields = mapAdditionalFields(
        aggregations,
        afSelections.additionalFields ?? [],
      );
    } else if (name === 'additionalFieldMetrics') {
      out.additionalFieldMetrics = mapAdditionalFieldMetrics(
        aggregations,
        afSelections.additionalFieldMetrics ?? [],
      );
    } else {
      out[name] = FACETS[name](aggregations?.[name]);
    }
  }
  return { facets: out };
}
