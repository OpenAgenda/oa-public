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
// objects/arrays. The TOP-LEVEL segment is always validated against the
// universe (a `nope.x` is a 400). The first NESTED segment is validated too
// wherever the resource declares a `children` keyset (so `location.zzz` is a
// 400) — the keysets are exactly the mapper's allowlists, so they can't drift.
// A leaf under an OPEN field (the `additionalFields` bag, a localized map, a
// pass-through object the mapper doesn't allowlist) stays best-effort.
//
// Where it can, the route pushes the selection down to the store so the heavy
// fields are never fetched. One generic translator (`selectionToIncludes`),
// driven by each resource's SELECT descriptor (co-located with its mapper),
// covers all three: events → ES `_source` (dotted paths kept, `additionalFields`
// sub-keys flattened, derived timings pull `timings`), agendas → ES
// `onlyIncludeFields` (top-level), locations → SQL `includeFields` (top-level,
// `verified`/`additionalFields` renamed to their columns). /me reuses the agenda
// translator for its public-index search; its SQL fallback only ADDS columns, so
// there the win is skipping the network/locationSet ref resolution (see
// meAgendas.js). `pickSelected` trims the mapped item regardless — the
// empty-as-empty rule reseeds absent fields, so the post-map trim is always
// required even when the pushdown narrowed the store read.
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

// Translate a resolved field selection into the store-projection list a service
// understands (event-search `includeFields`, agenda-search `onlyIncludeFields`,
// agenda-locations `includeFields`). One generic pass, driven by the resource's
// SELECT descriptor:
//   - `granularity: 'path'` keeps dotted paths (event-search projects sub-paths
//     of the `_source`); `'top'` collapses to the distinct top-level segments
//     (the others project whole subtrees / whole columns, and `pickSelected`
//     trims any dotted leaf afterwards).
//   - `store[top]` renames a contract field onto its store field/column.
//   - `derives[top]` adds the store fields a contract field is computed from.
//   - `bag` is the open additional-fields container: a sub-key (`bag.x`) maps to
//     the flat store key `x`; the bare bag needs its keys enumerated — the route
//     passes them as `bagKeys` (from the form schema), and without them the
//     selection can't be pushed down, so it returns `null` (= "fetch the normal
//     projection, rely on the post-map trim").
export function selectionToIncludes(
  selected,
  {
    granularity = 'top',
    store = {},
    derives = {},
    bag = null,
    bagKeys = null,
  } = {},
) {
  const includes = new Set();
  for (const path of selected) {
    const top = topSegment(path);
    if (bag && top === bag) {
      if (path === bag) {
        // The bare bag needs its keys enumerated; with none (not supplied, or
        // the agenda has no custom fields) we can't build an override that
        // KEEPS the bag, so bail to "no pushdown" — the full projection is
        // fetched and the post-map trim keeps whatever the bag holds.
        if (!bagKeys || bagKeys.length === 0) {
          return null;
        }
        bagKeys.forEach((key) => includes.add(key));
      } else {
        includes.add(path.slice(bag.length + 1));
      }
      continue;
    }
    includes.add(store[top] ?? (granularity === 'path' ? path : top));
    (derives[top] ?? []).forEach((dep) => includes.add(dep));
  }
  return [...includes];
}

// Does the selection include this top-level field? `null` (no selection) means
// "everything is selected" → true. Lets a route skip work for a field the
// caller didn't ask for (e.g. /me's network/locationSet ref resolution).
export function selectsTop(selected, name) {
  if (!selected) {
    return true;
  }
  for (const path of selected) {
    if (topSegment(path) === name) {
      return true;
    }
  }
  return false;
}

// Parse `?fields=` into the Set of field paths to keep, or `null` when the param
// is absent (no trimming — the default shape is returned).
//
// Accepts a comma-separated list (`fields=uid,title`) or repeated params
// (`fields=uid&fields=title`, which `qs` yields as an array). A bracketed/object
// form, an empty list, or a path whose TOP-LEVEL segment is outside `universe`
// (the resource's full field set) is a `400`. A dotted path is also a `400` when
// its FIRST nested segment is outside the resource's declared `children` keyset
// for that field (`location.zzz`); a leaf under a field WITHOUT a declared
// keyset (the open bag, a localized map, a pass-through object) stays
// best-effort.
export function resolveFields(rawFields, universe, children = {}) {
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

  const distinct = [...new Set(tokens)];

  const universeSet = new Set(universe);
  const unknown = distinct.filter((path) => !universeSet.has(topSegment(path)));
  if (unknown.length) {
    fail(`unknown field(s): ${unknown.join(', ')}`);
  }

  // Strict leaf: reject the first nested segment when the field declares a
  // keyset and the segment is outside it. Fields with no declared keyset (open
  // bag, localized map, pass-through object) keep best-effort leaves.
  const badLeaf = distinct.filter((path) => {
    const dot = path.indexOf('.');
    if (dot === -1) {
      return false;
    }
    const allowed = children[path.slice(0, dot)];
    if (!allowed) {
      return false;
    }
    const leaf = path.slice(dot + 1).split('.')[0];
    return !allowed.includes(leaf);
  });
  if (badLeaf.length) {
    fail(`unknown nested field(s): ${badLeaf.join(', ')}`);
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

// `pickSelected` runs once per item, but `selected` is invariant across a page
// (the same Set instance is passed for every row). Cache the compiled pick-tree
// by that Set so a 100-item page builds it once, not 100×. Keyed weakly so the
// per-request Set is collected with the request.
const treeCache = new WeakMap();
function selectionTree(selected) {
  let tree = treeCache.get(selected);
  if (tree === undefined) {
    tree = pathsToTree(selected);
    treeCache.set(selected, tree);
  }
  return tree;
}

// Trim one mapped item to the selected fields/paths. `selected` is the Set
// returned by `resolveFields`, or `null` for no trimming (returns the item
// untouched). Top-level order follows the item's own keys.
export function pickSelected(item, selected) {
  if (!selected || item == null || typeof item !== 'object') {
    return item;
  }
  return pickTree(item, selectionTree(selected));
}
