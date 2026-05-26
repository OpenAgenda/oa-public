// Translate validated v3 query parameters into a `core` event-search `query`.
//
// This is the strict gate the public contract promises: every documented filter
// is parsed and type/enum-checked here, and an unknown or malformed value yields
// a single `400` aggregating ALL field errors under `error.details.errors`
// (mirroring how `core`'s own validators report). We do NOT lean on `core`'s
// lenient `choice` validators, which silently drop unknown values.
//
// Only recognized parameters reach `core`. Undocumented keys (including the
// pagination params `after`/`limit`, owned by the route) are ignored — never
// forwarded — so visibility/moderation filters (`state`, `valid`, `removed`,
// `memberUid`, …) cannot be smuggled in through the query string.
//
// `req.query` is parsed by `qs` (extended): repeated params are arrays, and
// bracketed params (`age[gte]`, `extId[key]`, `custom[field]`) are nested
// objects. Every leaf value is a string until we coerce it.

import { BadRequest } from '@openagenda/verror';

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

const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const asList = (v) => (Array.isArray(v) ? v : [v]);

// "west,south,east,north" -> core `geo` { northEast, southWest }. The DSL maps
// northEast.lat/southWest.lng to top_left and southWest.lat/northEast.lng to
// bottom_right (see event-search getDSLQueryPart `_geoBounds`).
function parseBoundingBox(field, value, fail, isScalar) {
  if (!isScalar(field, value)) return undefined;
  const parts = String(value).split(',');
  if (parts.length !== 4) {
    fail(field, `${field} must be "west,south,east,north"`);
    return undefined;
  }
  const [west, south, east, north] = parts.map(Number);
  if ([west, south, east, north].some((n) => Number.isNaN(n))) {
    fail(field, `${field} must be four decimal degrees`);
    return undefined;
  }
  if (south < -90 || north > 90 || west < -180 || east > 180) {
    fail(field, `${field} coordinates are out of range`);
    return undefined;
  }
  return {
    northEast: { lat: north, lng: east },
    southWest: { lat: south, lng: west },
  };
}

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

function buildEventSearchQuery(rawQuery = {}) {
  const errors = [];
  const query = {};

  const fail = (field, message) => errors.push({ field, message });

  const isScalar = (field, value) => {
    if (Array.isArray(value) || isPlainObject(value)) {
      fail(field, `${field} must be a single value`);
      return false;
    }
    return true;
  };

  const toInt = (field, raw) => {
    const n = Number(raw);
    if (typeof raw === 'boolean' || !Number.isInteger(n)) {
      fail(field, `${field} must be an integer`);
      return undefined;
    }
    return n;
  };

  const intList = (field, value) => {
    const out = [];
    for (const raw of asList(value)) {
      if (Array.isArray(raw) || isPlainObject(raw)) {
        fail(field, `${field} must be a list of integers`);
        continue;
      }
      const n = toInt(field, raw);
      if (n !== undefined) out.push(n);
    }
    return out;
  };

  const stringList = (field, value) => {
    const out = [];
    for (const raw of asList(value)) {
      if (typeof raw !== 'string') {
        fail(field, `${field} must be a list of strings`);
        continue;
      }
      out.push(raw);
    }
    return out;
  };

  const enumList = (field, value, allowed, { asInt = false } = {}) => {
    const out = [];
    for (const raw of asList(value)) {
      if (Array.isArray(raw) || isPlainObject(raw)) {
        fail(field, `${field} has an invalid value`);
        continue;
      }
      const candidate = asInt ? Number(raw) : raw;
      if (
        (asInt && !Number.isInteger(candidate))
        || !allowed.includes(candidate)
      ) {
        fail(field, `${field} has an invalid value "${raw}"`);
        continue;
      }
      out.push(candidate);
    }
    return out;
  };

  const boolean = (field, value) => {
    if (!isScalar(field, value)) return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    fail(field, `${field} must be true or false`);
    return undefined;
  };

  const enumScalar = (field, value, allowed) => {
    if (!isScalar(field, value)) return undefined;
    if (!allowed.includes(value)) {
      fail(field, `${field} has an invalid value "${value}"`);
      return undefined;
    }
    return value;
  };

  const range = (field, value, { kind, min, max }) => {
    if (!isPlainObject(value)) {
      fail(field, `${field} must be a range object with gte and/or lte`);
      return undefined;
    }
    const out = {};
    for (const bound of Object.keys(value)) {
      if (bound !== 'gte' && bound !== 'lte') {
        fail(`${field}.${bound}`, 'unknown range bound (use gte/lte)');
        continue;
      }
      const raw = value[bound];
      if (Array.isArray(raw) || isPlainObject(raw)) {
        fail(`${field}.${bound}`, 'must be a single value');
        continue;
      }
      if (kind === 'int') {
        const n = toInt(`${field}.${bound}`, raw);
        if (n === undefined) continue;
        if ((min !== undefined && n < min) || (max !== undefined && n > max)) {
          fail(`${field}.${bound}`, `must be between ${min} and ${max}`);
          continue;
        }
        out[bound] = n;
      } else if (Number.isNaN(Date.parse(raw))) {
        fail(`${field}.${bound}`, 'must be an RFC 3339 date-time');
      } else {
        out[bound] = raw;
      }
    }
    return Object.keys(out).length ? out : undefined;
  };

  const keyValue = (field, value) => {
    if (!isPlainObject(value)) {
      fail(field, `${field} must be an object with key and value`);
      return undefined;
    }
    for (const k of Object.keys(value)) {
      if (k !== 'key' && k !== 'value') fail(`${field}.${k}`, 'unknown property');
    }
    if (typeof value.key !== 'string' || typeof value.value !== 'string') {
      fail(field, `${field} requires a string key and value`);
      return undefined;
    }
    return { key: value.key, value: value.value };
  };

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
  if (rawQuery.bbox !== undefined) {
    const geo = parseBoundingBox('bbox', rawQuery.bbox, fail, isScalar);
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

  // NOTE: `custom[<field>]` filtering is wired in a later slice (needs the
  // agenda's public form schema); it is intentionally not handled here yet.

  if (errors.length) {
    throw new BadRequest({ info: { errors } }, 'Invalid query parameters');
  }

  return query;
}

export default buildEventSearchQuery;
