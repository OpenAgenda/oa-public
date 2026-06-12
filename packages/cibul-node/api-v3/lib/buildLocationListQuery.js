// Translate validated v3 query parameters into an `agendaLocations` service
// list `query`.
//
// Same strict-gate philosophy as buildAgendaSearchQuery: every documented
// filter is parsed and type-checked here; a malformed value yields a single
// `400` aggregating ALL field errors under `error.details.errors`. Only the
// recognized location filters reach the service (`search`, `uids`, `extId`,
// `geo`, `createdAt`, `updatedAt`); pagination (`after`/`limit`) and the view
// toggle (`detailed`) are owned by the route, never forwarded. Notably the
// v2 quirk where an all-digits `search` is silently rewritten into a uid
// filter (core's preCleanSearchQuery) is NOT reproduced: v3 has a dedicated
// `uid` filter, so `search` always means text search.

import { BadRequest } from '@openagenda/verror';

const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const asList = (v) => (Array.isArray(v) ? v : [v]);

const RANGE_BOUNDS = ['gte', 'lte', 'gt', 'lt'];

function buildLocationListQuery(rawQuery = {}) {
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

  const intList = (field, value) => {
    const out = [];
    for (const raw of asList(value)) {
      if (Array.isArray(raw) || isPlainObject(raw)) {
        fail(field, `${field} must be a list of integers`);
        continue;
      }
      const n = Number(raw);
      if (typeof raw === 'boolean' || !Number.isInteger(n)) {
        fail(field, `${field} must be a list of integers`);
        continue;
      }
      out.push(n);
    }
    return out;
  };

  const number = (field, value, { min, max } = {}) => {
    if (!isScalar(field, value)) return undefined;
    const n = Number(value);
    if (typeof value === 'boolean' || value === '' || Number.isNaN(n)) {
      fail(field, `${field} must be a number`);
      return undefined;
    }
    if ((min !== undefined && n < min) || (max !== undefined && n > max)) {
      fail(field, `${field} must be between ${min} and ${max}`);
      return undefined;
    }
    return n;
  };

  // A `createdAt[gte]=…`-style deepObject of RFC 3339 date-time bounds.
  const dateRange = (field, value) => {
    if (!isPlainObject(value)) {
      fail(field, `${field} must be an object of gte/lte/gt/lt bounds`);
      return undefined;
    }
    const out = {};
    for (const [bound, raw] of Object.entries(value)) {
      if (!RANGE_BOUNDS.includes(bound)) {
        fail(`${field}.${bound}`, 'unknown range bound (use gte/lte/gt/lt)');
        continue;
      }
      if (typeof raw !== 'string' || Number.isNaN(Date.parse(raw))) {
        fail(`${field}.${bound}`, 'must be an RFC 3339 date-time');
        continue;
      }
      out[bound] = new Date(raw);
    }
    return Object.keys(out).length ? out : undefined;
  };

  // ---- text ----
  if (rawQuery.search !== undefined && isScalar('search', rawQuery.search)) {
    query.search = rawQuery.search;
  }

  // ---- identity ----
  if (rawQuery.uid !== undefined) {
    const list = intList('uid', rawQuery.uid);
    if (list.length) query.uids = list;
  }

  if (rawQuery.extId !== undefined) {
    if (!isPlainObject(rawQuery.extId)) {
      fail('extId', 'extId must be passed as extId[key]=…&extId[value]=…');
    } else {
      const extId = {};
      for (const [k, v] of Object.entries(rawQuery.extId)) {
        if (k !== 'key' && k !== 'value') {
          fail(`extId.${k}`, 'unknown property (use key and value)');
        } else if (typeof v !== 'string' || !v) {
          fail(`extId.${k}`, 'must be a non-empty string');
        } else {
          extId[k] = v;
        }
      }
      if (extId.key === undefined || extId.value === undefined) {
        fail('extId', 'both extId[key] and extId[value] are required');
      } else {
        query.extId = extId;
      }
    }
  }

  // ---- geography ----
  // `bbox=west,south,east,north` (decimal degrees, WGS84) — the same bounding
  // box convention as the events list.
  if (rawQuery.bbox !== undefined && isScalar('bbox', rawQuery.bbox)) {
    const parts = String(rawQuery.bbox).split(',');
    if (parts.length !== 4) {
      fail('bbox', 'bbox must be west,south,east,north in decimal degrees');
    } else {
      const west = number('bbox', parts[0], { min: -180, max: 180 });
      const south = number('bbox', parts[1], { min: -90, max: 90 });
      const east = number('bbox', parts[2], { min: -180, max: 180 });
      const north = number('bbox', parts[3], { min: -90, max: 90 });
      if ([west, south, east, north].every((v) => v !== undefined)) {
        query.geo = {
          northEast: { lat: north, lng: east },
          southWest: { lat: south, lng: west },
        };
      }
    }
  }

  // ---- dates ----
  if (rawQuery.createdAt !== undefined) {
    const range = dateRange('createdAt', rawQuery.createdAt);
    if (range) query.createdAt = range;
  }
  if (rawQuery.updatedAt !== undefined) {
    const range = dateRange('updatedAt', rawQuery.updatedAt);
    if (range) query.updatedAt = range;
  }

  if (errors.length) {
    throw new BadRequest({ info: { errors } }, 'Invalid query parameters');
  }

  return query;
}

export default buildLocationListQuery;
