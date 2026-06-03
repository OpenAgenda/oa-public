// Translate validated v3 query parameters into a `core` agenda-search `query`.
//
// Same strict-gate philosophy as buildEventSearchQuery: every documented filter
// is parsed and type-checked here; an unknown or malformed value yields a single
// `400` aggregating ALL field errors under `error.details.errors`. Only the
// recognized agenda filters reach `core` (the agenda-search query keys are
// `search`, `uid`, `slug`, `official`); pagination (`after`/`limit`) and the
// view toggle (`detailed`) are owned by the route, never forwarded.

import { BadRequest } from '@openagenda/verror';

const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const asList = (v) => (Array.isArray(v) ? v : [v]);

function buildAgendaSearchQuery(rawQuery = {}) {
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

  const boolean = (field, value) => {
    if (!isScalar(field, value)) return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    fail(field, `${field} must be true or false`);
    return undefined;
  };

  // ---- text ----
  if (rawQuery.search !== undefined && isScalar('search', rawQuery.search)) {
    query.search = rawQuery.search;
  }

  // ---- identity ----
  if (rawQuery.uid !== undefined) {
    const list = intList('uid', rawQuery.uid);
    if (list.length) query.uid = list;
  }
  if (rawQuery.slug !== undefined) {
    const list = stringList('slug', rawQuery.slug);
    if (list.length) query.slug = list;
  }

  // ---- classification ----
  if (rawQuery.official !== undefined) {
    const value = boolean('official', rawQuery.official);
    if (value !== undefined) query.official = value;
  }

  if (errors.length) {
    throw new BadRequest({ info: { errors } }, 'Invalid query parameters');
  }

  return query;
}

export default buildAgendaSearchQuery;
