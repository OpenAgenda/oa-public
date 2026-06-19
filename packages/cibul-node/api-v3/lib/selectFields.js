// Sparse field selection (`?fields=`) for the v3 list reads.
//
// A subtractive, top-level field selector: the caller names the fields it wants
// kept and the response items are trimmed to that subset, shrinking the payload
// of large list pages (sync scripts). It only RESTRICTS — `view`/`detailed`
// chooses the shape, `fields` keeps a subset of it. An unknown or out-of-view
// name is a `400`, mirroring the `limit`/`detailed`/`sort` gates: an
// out-of-contract value is a bad request, not a silently-ignored one.
//
// The response SCHEMA is unchanged (still fully `required`): `fields` is a
// best-effort payload optimisation, documented as such. The generated SDK type
// therefore over-promises on the `fields` path — a caller that trims a field
// and then reads it gets `undefined` at runtime. Honest exact typing is a
// separate, additive follow-up (a `Pick<T, Fields>` overlay in the api-client
// seam); nothing here depends on it.

import { BadRequest } from '@openagenda/verror';

// `uid` identifies the resource; a sparse item without it can't be correlated
// back to anything, so `fields` always retains it on top of the explicit
// selection — selecting it or not is a no-op.
const IDENTITY_FIELD = 'uid';

// The selectable top-level field names of a view = exactly the keys its mapper
// emits. The v3 mappers are pure and empty-tolerant (the empty-as-empty rule
// fills every declared field), so probing one with `{}` yields its full key set
// and keeps this list in lockstep with the mapper — no separate allowlist to
// drift. `extra` carries names a route adds AROUND the mapper (e.g. /me's
// `role`/`private`, grafted onto the agenda shape in the envelope).
export function fieldNamesOf(mapItem, extra = []) {
  return [...Object.keys(mapItem({})), ...extra];
}

// Parse `?fields=` into the Set of top-level field names to keep, or `null`
// when the param is absent (no trimming — the full view is returned).
//
// Accepts a comma-separated list (`fields=uid,title`) or repeated params
// (`fields=uid&fields=title`, which `qs` yields as an array). A bracketed/object
// form, an empty list, or any name outside `allowed` (the ACTIVE view's field
// names) is a `400`.
export function resolveFields(rawFields, allowed) {
  if (rawFields === undefined) {
    return null;
  }

  const fail = (message) => {
    throw new BadRequest(
      { info: { errors: [{ field: 'fields', message }] } },
      'Invalid query parameters',
    );
  };

  // qs yields a plain object for a bracketed `fields[x]=…`; not a field list.
  if (
    rawFields !== null
    && typeof rawFields === 'object'
    && !Array.isArray(rawFields)
  ) {
    fail('fields must be a comma-separated list of field names');
  }

  const tokens = (Array.isArray(rawFields) ? rawFields : [rawFields])
    .flatMap((value) => String(value).split(','))
    .map((name) => name.trim())
    .filter((name) => name !== '');

  if (!tokens.length) {
    fail('fields must list at least one field name');
  }

  const allowedSet = new Set(allowed);
  const unknown = [...new Set(tokens)].filter((name) => !allowedSet.has(name));
  if (unknown.length) {
    fail(`unknown field(s): ${unknown.join(', ')}`);
  }

  return new Set([IDENTITY_FIELD, ...tokens]);
}

// Trim one mapped item to the selected top-level fields. `selected` is the Set
// returned by `resolveFields`, or `null` for no trimming (returns the item
// untouched). Iterates the item's own keys so the output key order matches the
// full shape.
export function pickSelected(item, selected) {
  if (!selected || item == null || typeof item !== 'object') {
    return item;
  }
  const out = {};
  for (const key of Object.keys(item)) {
    if (selected.has(key)) {
      out[key] = item[key];
    }
  }
  return out;
}
