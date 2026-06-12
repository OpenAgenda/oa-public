// Translate validated v3 query parameters into an `agendaLocations` service
// list `query`.
//
// Same strict-gate philosophy as buildEventSearchQuery (shared primitives in
// queryValidation.js): every documented filter is parsed and type-checked
// here; a malformed value yields a single `400` aggregating ALL field errors
// under `error.details.errors`. Only the recognized location filters reach
// the service (`search`, `uids`, `extId`, `geo`, `createdAt`, `updatedAt`);
// pagination (`after`/`limit`) and the view toggle (`detailed`) are owned by
// the route, never forwarded. Notably the v2 quirk where an all-digits
// `search` is silently rewritten into a uid filter (core's
// preCleanSearchQuery) is NOT reproduced: v3 has a dedicated `uid` filter, so
// `search` always means text search.

import createQueryGate, { isPlainObject } from './queryValidation.js';

// The service's own `search` validator caps at 255 (and would answer with its
// internal error shape, echoing the input) — enforce the limit here so the
// 400 stays in the gate's `{ field, message }` vocabulary.
const SEARCH_MAX_LENGTH = 255;

function buildLocationListQuery(rawQuery = {}) {
  const query = {};
  const { fail, throwIfInvalid, isScalar, intList, range, parseBoundingBox } = createQueryGate();

  // ---- text ----
  if (rawQuery.search !== undefined && isScalar('search', rawQuery.search)) {
    if (String(rawQuery.search).length > SEARCH_MAX_LENGTH) {
      fail('search', `search must be at most ${SEARCH_MAX_LENGTH} characters`);
    } else {
      query.search = rawQuery.search;
    }
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
  if (rawQuery.bbox !== undefined) {
    const geo = parseBoundingBox('bbox', rawQuery.bbox);
    if (geo) query.geo = geo;
  }

  // ---- dates ----
  // The SQL-backed service compares Date objects (`output: 'date'`).
  if (rawQuery.createdAt !== undefined) {
    const value = range('createdAt', rawQuery.createdAt, {
      kind: 'date',
      output: 'date',
    });
    if (value) query.createdAt = value;
  }
  if (rawQuery.updatedAt !== undefined) {
    const value = range('updatedAt', rawQuery.updatedAt, {
      kind: 'date',
      output: 'date',
    });
    if (value) query.updatedAt = value;
  }

  throwIfInvalid();

  return query;
}

export default buildLocationListQuery;
