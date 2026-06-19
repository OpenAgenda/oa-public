// Sparse field selection (`?fields=`) for the v3 list reads.
//
// `fields` is a direct projection selector, not a subset-of-a-view: when it is
// present it picks the response shape outright, so `detailed` becomes moot (it
// only governs the default shape when `fields` is ABSENT). The selectable names
// are therefore the resource's FULL field universe — the richest its list can
// project — not just the active tier: `?fields=longDescription` is valid with
// no `detailed=true`. An unknown name (not in that universe) is a `400`,
// mirroring the `limit`/`detailed`/`sort` gates; `uid` is always retained.
//
// Dotted paths (`location.name`, `additionalFields.x`) descend into nested
// objects/arrays. Validation is strict on the TOP-LEVEL segment (a `nope.x` is a
// 400) and best-effort on the leaf (an unknown sub-key just yields nothing) —
// enumerating every nested sub-schema would be disproportionate, and this
// matches the v2 selector.
//
// Where it can, the route pushes the selection down to the store so the heavy
// fields are never fetched: events → ES `_source` (`eventFieldsToIncludes`),
// agendas → ES `onlyIncludeFields` (`agendaFieldsToOnlyIncludes`). Locations and
// /me fetch the richest projection and this module trims the mapped item — same
// observable result, just not lighter on the wire (their SQL stores don't
// restrict columns cleanly: the locations keyset needs the internal `id`, and
// the members projection only ADDS columns).
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

// Event fields the search service DERIVES from the full `timings` array (a
// post-search parser computes them), so requesting any of them must still
// project `timings` into the `_source` even when the caller didn't ask for it.
const TIMING_DERIVED = ['firstTiming', 'lastTiming', 'nextTiming'];

// Contract field -> agenda-locations service field, for the few that differ.
// `verified` reads the service's `state` flag; `additionalFields` wraps `tags`.
const LOCATION_FIELD_TO_SERVICE = {
  verified: 'state',
  additionalFields: 'tags',
};

const topSegment = (path) => path.split('.')[0];

// The selectable top-level field names of a view = exactly the keys its mapper
// emits. The v3 mappers are pure and empty-tolerant (the empty-as-empty rule
// fills every declared field), so probing one with `{}` yields its full key set
// and keeps this list in lockstep with the mapper — no separate allowlist to
// drift. The route passes the RICHEST mapper (the full universe), since `fields`
// is no longer gated by `detailed`. `extra` carries names a route adds AROUND
// the mapper (e.g. /me's `role`/`private`, grafted onto the agenda shape).
export function fieldNamesOf(mapItem, extra = []) {
  return [...Object.keys(mapItem({})), ...extra];
}

// Translate a resolved event field selection into the event-search
// `includeFields` (an OVERRIDE of the `_source`: only these are fetched). Mostly
// identity — the contract names (incl. dotted, e.g. `location.name`) match the
// `_source` names — plus two provenance rules:
//   - a derived timing field also pulls `timings` (the parser needs it);
//   - `additionalFields.<key>` maps to the flat custom field `<key>`, but the
//     whole `additionalFields` bag can't be enumerated here (its keys come from
//     the form schema), so it bails to `null` = "no pushdown for this request":
//     the route fetches the normal projection and the mapped item is still
//     trimmed. Common payload-shrinking selections never hit this.
export function eventFieldsToIncludes(selected) {
  const includes = new Set();
  for (const path of selected) {
    const top = topSegment(path);
    if (top === 'additionalFields') {
      if (path === 'additionalFields') {
        return null;
      }
      includes.add(path.slice('additionalFields.'.length));
      continue;
    }
    includes.add(path);
    if (TIMING_DERIVED.includes(top)) {
      includes.add('timings');
    }
  }
  return [...includes];
}

// Translate a resolved agenda field selection into the agenda-search
// `onlyIncludeFields` (an OVERRIDE of the `_source`). The AgendaDetailed names
// map 1:1 onto the index fields; a bare top-level name projects its whole
// subtree (e.g. `network` -> network.uid/title), so we only need the distinct
// top-level segments and let `pickSelected` trim any dotted leaf.
export function agendaFieldsToOnlyIncludes(selected) {
  return [...new Set([...selected].map(topSegment))];
}

// Translate a resolved location field selection into the agenda-locations
// service `includeFields` (RESTRICTS the SQL columns). Mostly identity, with the
// two renamed fields mapped to their service names.
export function locationFieldsToIncludes(selected) {
  return [
    ...new Set(
      [...selected].map((path) => {
        const top = topSegment(path);
        return LOCATION_FIELD_TO_SERVICE[top] ?? top;
      }),
    ),
  ];
}

// Parse `?fields=` into the Set of field paths to keep, or `null` when the param
// is absent (no trimming — the default shape is returned).
//
// Accepts a comma-separated list (`fields=uid,title`) or repeated params
// (`fields=uid&fields=title`, which `qs` yields as an array). A bracketed/object
// form, an empty list, or a path whose TOP-LEVEL segment is outside `allowed`
// (the resource's full field universe) is a `400`.
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
  const unknown = [...new Set(tokens)].filter(
    (path) => !allowedSet.has(topSegment(path)),
  );
  if (unknown.length) {
    fail(`unknown field(s): ${unknown.join(', ')}`);
  }

  return new Set([IDENTITY_FIELD, ...tokens]);
}

// Build a pick-tree from a set of dotted paths: each node is either `true`
// (keep the whole subtree from here) or a nested `{ segment: node }`. A bare
// path (`location`) wins over a deeper one (`location.name`) — the whole object
// is kept.
function pathsToTree(paths) {
  const tree = {};
  for (const path of paths) {
    const segments = path.split('.');
    let node = tree;
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      if (i === segments.length - 1) {
        node[segment] = true;
      } else {
        if (node[segment] === true) {
          break;
        }
        if (node[segment] === undefined) {
          node[segment] = {};
        }
        node = node[segment];
      }
    }
  }
  return tree;
}

// Trim a value to a pick-tree. `true` keeps the whole value; arrays map the same
// sub-tree over their elements (so `timings.begin` trims each timing); objects
// keep only their selected keys, recursing into nested sub-trees.
function pickTree(value, tree) {
  if (tree === true) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => pickTree(entry, tree));
  }
  if (value == null || typeof value !== 'object') {
    return value;
  }
  const out = {};
  for (const key of Object.keys(value)) {
    if (key in tree) {
      out[key] = pickTree(value[key], tree[key]);
    }
  }
  return out;
}

// Trim one mapped item to the selected fields/paths. `selected` is the Set
// returned by `resolveFields`, or `null` for no trimming (returns the item
// untouched). Top-level order follows the item's own keys.
export function pickSelected(item, selected) {
  if (!selected || item == null || typeof item !== 'object') {
    return item;
  }
  return pickTree(item, pathsToTree(selected));
}
