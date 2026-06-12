// Translate validated v3 query parameters into a `core` agenda-search `query`.
//
// Same strict-gate philosophy as buildEventSearchQuery (shared primitives in
// queryValidation.js): every documented filter is parsed and type-checked
// here; an unknown or malformed value yields a single `400` aggregating ALL
// field errors under `error.details.errors`. Only the recognized agenda
// filters reach `core` (the agenda-search query keys are `search`, `uid`,
// `slug`, `official`); pagination (`after`/`limit`) and the view toggle
// (`detailed`) are owned by the route, never forwarded.

import createQueryGate from './queryValidation.js';

function buildAgendaSearchQuery(rawQuery = {}) {
  const query = {};
  const { throwIfInvalid, isScalar, intList, stringList, boolean } = createQueryGate();

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

  throwIfInvalid();

  return query;
}

export default buildAgendaSearchQuery;
