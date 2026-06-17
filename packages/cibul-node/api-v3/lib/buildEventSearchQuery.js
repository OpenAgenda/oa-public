// Translate validated v3 query parameters into a `core` event-search `query`.
//
// This is the strict gate the public contract promises (shared primitives in
// queryValidation.js): every documented filter is parsed and type/enum-checked
// here, and an unknown or malformed value yields a single `400` aggregating
// ALL field errors under `error.details.errors` (mirroring how `core`'s own
// validators report). We do NOT lean on `core`'s lenient `choice` validators,
// which silently drop unknown values.
//
// Only recognized parameters reach `core`. Undocumented keys (including the
// pagination params `after`/`limit`, owned by the route) are ignored — never
// forwarded — so visibility/moderation filters (`state`, `valid`, `removed`,
// `memberUid`, …) cannot be smuggled in through the query string.

import createQueryGate, { isPlainObject, asList } from './queryValidation.js';

const SORT_VALUES = [
  'timings.asc',
  'timingsWithFeatured.asc',
  'lastTiming.asc',
  'lastTimingWithFeatured.asc',
  'updatedAt.asc',
  'updatedAt.desc',
  'location.name.asc',
  'location.name.desc',
  'location.city.asc',
  'location.city.desc',
  'score',
];
const ACCESSIBILITY_VALUES = ['hi', 'ii', 'mi', 'pi', 'vi'];
const STATUS_VALUES = [1, 2, 3, 4, 5, 6];
const ATTENDANCE_VALUES = [1, 2, 3];
const RELATIVE_VALUES = ['passed', 'upcoming', 'current'];

// param name -> core query key, for plain string-list filters.
const STRING_LIST_FILTERS = {
  slug: 'slug',
  keyword: 'keyword',
  language: 'languages',
  region: 'region',
  department: 'department',
  city: 'city',
  district: 'district',
  adminLevel3: 'adminLevel3',
  adminLevel5: 'adminLevel5',
};

// param name -> core query key, for integer-list filters.
const INT_LIST_FILTERS = {
  uid: 'uid',
  locationUid: 'locationUid',
  sourceAgendaUid: 'sourceAgendaUid',
};

// `near` ("lat,lng") + `radius` (metres) -> core `geoDistance`. Both are
// required together; one without the other is a 400.
function parseProximity(rawQuery, query, fail) {
  const hasNear = rawQuery.near !== undefined;
  const hasRadius = rawQuery.radius !== undefined;

  if (hasNear !== hasRadius) {
    fail(
      hasNear ? 'radius' : 'near',
      'near and radius must be provided together',
    );
    return;
  }
  if (!hasNear) return;

  if (Array.isArray(rawQuery.near) || isPlainObject(rawQuery.near)) {
    fail('near', 'near must be a single "lat,lng" value');
    return;
  }
  const parts = String(rawQuery.near).split(',');
  if (parts.length !== 2) {
    fail('near', 'near must be "lat,lng"');
    return;
  }
  const [lat, lng] = parts.map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    fail('near', 'near must be two decimal degrees');
    return;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    fail('near', 'near coordinates are out of range');
    return;
  }

  const radius = Number(rawQuery.radius);
  if (
    Array.isArray(rawQuery.radius)
    || isPlainObject(rawQuery.radius)
    || !Number.isInteger(radius)
    || radius < 1
  ) {
    fail('radius', 'radius must be a positive integer (metres)');
    return;
  }

  query.geoDistance = { center: { lat, lng }, distance: radius };
}

// `additionalFields[<field>]` -> core `query.custom` (the public param is
// `additionalFields`; `custom` stays core's internal query key). Without the
// agenda schema here we only validate the SHAPE: each field is a scalar, a list
// of scalars, or a numeric range object (gte/lte/gt/lt). `core` does the
// schema-aware typing and access filtering. Unknown fields are passed through
// and ignored server-side.
const CUSTOM_RANGE_BOUNDS = ['gte', 'lte', 'gt', 'lt'];

function parseAdditionalFields(field, value, fail) {
  if (!isPlainObject(value)) {
    fail(field, 'additionalFields must be an object of field filters');
    return undefined;
  }
  const out = {};
  for (const [name, raw] of Object.entries(value)) {
    if (isPlainObject(raw)) {
      const rangeOut = {};
      for (const bound of Object.keys(raw)) {
        if (!CUSTOM_RANGE_BOUNDS.includes(bound)) {
          fail(
            `${field}.${name}.${bound}`,
            'unknown range bound (use gte/lte/gt/lt)',
          );
          continue;
        }
        if (Array.isArray(raw[bound]) || isPlainObject(raw[bound])) {
          fail(`${field}.${name}.${bound}`, 'must be a single value');
          continue;
        }
        rangeOut[bound] = raw[bound];
      }
      if (Object.keys(rangeOut).length) out[name] = rangeOut;
    } else if (Array.isArray(raw)) {
      if (raw.some((v) => Array.isArray(v) || isPlainObject(v))) {
        fail(`${field}.${name}`, 'must be a scalar or a list of scalars');
      } else {
        out[name] = raw;
      }
    } else {
      out[name] = raw;
    }
  }
  return out;
}

function buildEventSearchQuery(rawQuery = {}) {
  const query = {};
  const {
    fail,
    throwIfInvalid,
    isScalar,
    intList,
    stringList,
    enumList,
    enumScalar,
    boolean,
    range,
    keyValue,
    parseBoundingBox,
  } = createQueryGate();

  // ---- text & identity ----
  if (rawQuery.search !== undefined && isScalar('search', rawQuery.search)) {
    query.search = rawQuery.search;
  }
  if (rawQuery.extId !== undefined) {
    const extId = keyValue('extId', rawQuery.extId);
    if (extId) query.extId = extId;
  }

  // ---- integer-list & string-list filters ----
  for (const [param, key] of Object.entries(INT_LIST_FILTERS)) {
    if (rawQuery[param] === undefined) continue;
    const list = intList(param, rawQuery[param]);
    if (list.length) query[key] = list;
  }
  for (const [param, key] of Object.entries(STRING_LIST_FILTERS)) {
    if (rawQuery[param] === undefined) continue;
    const list = stringList(param, rawQuery[param]);
    if (list.length) query[key] = list;
  }

  // ---- classification ----
  if (rawQuery.accessibility !== undefined) {
    const list = enumList(
      'accessibility',
      rawQuery.accessibility,
      ACCESSIBILITY_VALUES,
    );
    if (list.length) query.accessibility = list;
  }
  if (rawQuery.status !== undefined) {
    const list = enumList('status', rawQuery.status, STATUS_VALUES, {
      asInt: true,
    });
    if (list.length) query.status = list;
  }
  if (rawQuery.attendanceMode !== undefined) {
    const list = enumList(
      'attendanceMode',
      rawQuery.attendanceMode,
      ATTENDANCE_VALUES,
      {
        asInt: true,
      },
    );
    if (list.length) query.attendanceMode = list;
  }
  if (rawQuery.featured !== undefined) {
    const value = boolean('featured', rawQuery.featured);
    if (value !== undefined) query.featured = value;
  }

  // ---- place ----
  if (rawQuery.locationExtId !== undefined) {
    const extId = keyValue('locationExtId', rawQuery.locationExtId);
    if (extId) query.locationExtId = extId;
  }
  if (rawQuery.countryCode !== undefined) {
    const out = [];
    for (const raw of asList(rawQuery.countryCode)) {
      if (typeof raw !== 'string' || !/^[A-Za-z]{2}$/.test(raw)) {
        fail(
          'countryCode',
          `countryCode must be a 2-letter code (got "${raw}")`,
        );
        continue;
      }
      out.push(raw.toUpperCase());
    }
    if (out.length) query.countryCode = out;
  }
  // The DSL maps northEast.lat/southWest.lng to top_left and
  // southWest.lat/northEast.lng to bottom_right (see event-search
  // getDSLQueryPart `_geoBounds`).
  if (rawQuery.bbox !== undefined) {
    const geo = parseBoundingBox('bbox', rawQuery.bbox);
    if (geo) query.geo = geo;
  }
  parseProximity(rawQuery, query, fail);

  // ---- provenance ----
  const originAgenda = {};
  if (rawQuery.originAgendaUid !== undefined) {
    const list = intList('originAgendaUid', rawQuery.originAgendaUid);
    if (list.length) originAgenda.uid = list;
  }
  if (rawQuery.originAgendaOfficial !== undefined) {
    const value = boolean(
      'originAgendaOfficial',
      rawQuery.originAgendaOfficial,
    );
    if (value !== undefined) originAgenda.official = value;
  }
  if (Object.keys(originAgenda).length) query.originAgenda = originAgenda;

  // ---- time ----
  // Date bounds are forwarded as validated strings: Elasticsearch parses them
  // (`output: 'string'`, the gate's default).
  if (rawQuery.relative !== undefined) {
    const list = enumList('relative', rawQuery.relative, RELATIVE_VALUES);
    if (list.length) query.relative = list;
  }
  if (rawQuery.timings !== undefined) {
    const value = range('timings', rawQuery.timings, { kind: 'date' });
    if (value) query.timings = value;
  }
  if (rawQuery.localTime !== undefined) {
    const value = range('localTime', rawQuery.localTime, {
      kind: 'int',
      min: 0,
      max: 1440,
    });
    if (value) query.localTime = value;
  }
  if (rawQuery.createdAt !== undefined) {
    const value = range('createdAt', rawQuery.createdAt, { kind: 'date' });
    if (value) query.createdAt = value;
  }
  if (rawQuery.updatedAt !== undefined) {
    const value = range('updatedAt', rawQuery.updatedAt, { kind: 'date' });
    if (value) query.updatedAt = value;
  }

  // ---- audience ----
  if (rawQuery.age !== undefined) {
    const value = range('age', rawQuery.age, { kind: 'int', min: 0 });
    if (value) query.age = value;
  }

  // ---- sort ----
  if (rawQuery.sort !== undefined) {
    const value = enumScalar('sort', rawQuery.sort, SORT_VALUES);
    if (value !== undefined) query.sort = value;
  }

  // ---- relevance threshold ----
  // Score floor for syntactic (`search`) results: 'off' (default), 'auto'
  // (dynamic elbow cutoff), or a non-negative number used as an absolute
  // min_score. Numeric strings are coerced; anything else is a 400. A
  // boolean-false / "false" form normalises to 'off' — YAML 1.1 tooling can
  // mis-parse the spec's `off` bareword as boolean false, so a generated client
  // may send it rather than the literal string.
  if (
    rawQuery.threshold !== undefined
    && isScalar('threshold', rawQuery.threshold)
  ) {
    const raw = rawQuery.threshold;
    if (raw === 'off' || raw === 'false' || raw === false) {
      query.threshold = 'off';
    } else if (raw === 'auto') {
      query.threshold = 'auto';
    } else {
      const n = Number(raw);
      // `Number('')`/`Number(' ')` are 0 and `Number(true)` is 1 — reject
      // blanks and booleans explicitly (the shared gate's doctrine) so a
      // dangling `threshold=` is a 400, not a silent min_score 0.
      if (
        typeof raw !== 'boolean'
        && String(raw).trim() !== ''
        && Number.isFinite(n)
        && n >= 0
      ) {
        query.threshold = n;
      } else {
        fail(
          'threshold',
          'threshold must be "off", "auto", or a non-negative number',
        );
      }
    }
  }

  // ---- agenda-specific additional fields ----
  // We pass `additionalFields[<field>]` through under core's `query.custom`;
  // `core` resolves the agenda's form schema (auto-injected from the loaded
  // agenda) to type-clean each value and enforce per-field read access, so a
  // restricted field is dropped server-side. We only structurally validate the
  // shape here.
  if (rawQuery.additionalFields !== undefined) {
    const additionalFields = parseAdditionalFields(
      'additionalFields',
      rawQuery.additionalFields,
      fail,
    );
    if (additionalFields && Object.keys(additionalFields).length) {
      query.custom = additionalFields;
    }
  }

  throwIfInvalid();

  return query;
}

export default buildEventSearchQuery;
