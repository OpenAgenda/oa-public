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
// objects/arrays. Validation is TOTAL against the spec-derived field tree (see
// lib/specFieldTree.js): EVERY segment is checked against the contract at its
// level — `nope` (top), `location.zzz`, `image.variants.zzz` are all 400s. The
// only best-effort nodes are the contract's real open containers (a node the
// tree marks OPEN: the `additionalFields` bag, a localized text map, any
// `additionalProperties: true` object) — under one, every deeper leaf is
// accepted. The frontier is the contract's, not which fields have a mapper
// allowlist.
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
// The boundary speaks ONE projection intent — "project only these fields" — via
// `applyProjection`. The three services name that intent differently in their
// own signatures (events/locations `includeFields`, agendas `onlyIncludeFields`),
// so each SELECT descriptor carries the native `option` and the helper sets it.
// The convergence lives HERE, at the v3 boundary, not in the service signatures:
// those option names are load-bearing for ~26 internal callers, and
// event-search's `includeFields` doubles as the public v2 `/events?if=` query
// param — renaming them would break consumers for a gain invisible to the v3
// contract (see docs/design-v3-field-selection.md, Lot A verdict). v3 only ever
// needs the RESTRICTIVE axis; the ADDITIVE one (`include`) is an internal-
// consumer concern these services keep to themselves.
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

// Push a resolved `?fields=` selection down to a service's native restrictive
// projection option, mutating and returning `options`. This is the v3 boundary
// expressing one intent ("project only these") uniformly across the three
// services: the resource's SELECT descriptor names the service option
// (`descriptor.option` — events/locations `includeFields`, agendas
// `onlyIncludeFields`) and `selectionToIncludes` (driven by the same descriptor)
// builds the value. `extra` carries per-call descriptor overrides (events pass
// the enumerated `bagKeys`). A `null` selection (no `?fields=`) is a no-op; a
// `null` translation (the bare additional-fields bag with no enumerable keys)
// leaves the option unset, so the route falls back to the normal projection and
// relies on the post-map `pickSelected` trim.
export function applyProjection(options, fields, descriptor, extra) {
  if (!fields) {
    return options;
  }
  const includes = selectionToIncludes(
    fields,
    extra ? { ...descriptor, ...extra } : descriptor,
  );
  if (includes) {
    options[descriptor.option] = includes;
  }
  return options;
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
// form or an empty list is a `400`. Each path is then validated SEGMENT BY
// SEGMENT against the resource's spec-derived field tree (see specFieldTree.js):
// an unknown top-level field (`nope`) or an unknown nested sub-field at any
// closed level (`location.zzz`, `image.variants.zzz`) is a `400`. Descent stops
// at an OPEN node (a node valued `true`: the additional-fields bag, a localized
// map, any `additionalProperties: true` object), under which every leaf is
// accepted best-effort.
export function resolveFields(rawFields, fieldTree) {
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

  // Walk each dotted path through the field tree. A node is either `true`
  // (OPEN — accept the rest of the path) or a closed `{ subField: node }` map
  // whose keys gate the next segment.
  // Membership is tested with `Object.hasOwn`, never `tree[seg]`/`seg in tree`:
  // the spec trees are plain objects, so a bare index would resolve inherited
  // `Object.prototype` members (`constructor`, `toString`, `__proto__`, …) to a
  // truthy node and wave those names through as valid fields (a 200 where the
  // contract mandates a 400). Own-key checks gate strictly on the real schema.
  const unknownTop = [];
  const unknownNested = [];
  const malformed = [];
  for (const path of distinct) {
    const segments = path.split('.');
    // An empty segment (`title.`, `a..b`) is a malformed path. Under a closed
    // node it already 400s (the empty key is unknown); rejecting it here makes
    // OPEN nodes consistent instead of silently emptying them (`title.` → `{}`).
    if (segments.some((segment) => segment === '')) {
      malformed.push(path);
      continue;
    }
    let node = Object.hasOwn(fieldTree, segments[0])
      ? fieldTree[segments[0]]
      : undefined;
    if (node === undefined) {
      unknownTop.push(path);
      continue;
    }
    for (let i = 1; i < segments.length; i += 1) {
      if (node === true) {
        break; // OPEN container — every deeper leaf is best-effort.
      }
      node = Object.hasOwn(node, segments[i]) ? node[segments[i]] : undefined;
      if (node === undefined) {
        unknownNested.push(path);
        break;
      }
    }
  }
  if (malformed.length) {
    fail(`malformed field path(s): ${malformed.join(', ')}`);
  }
  if (unknownTop.length) {
    fail(`unknown field(s): ${unknownTop.join(', ')}`);
  }
  if (unknownNested.length) {
    fail(`unknown nested field(s): ${unknownNested.join(', ')}`);
  }

  return new Set([IDENTITY_FIELD, ...tokens]);
}

// Build a pick-tree from a set of dotted paths: each node is either `true`
// (keep the whole subtree from here) or a nested `{ segment: node }`. A bare
// path (`location`) wins over a deeper one (`location.name`) — the whole object
// is kept.
function pathsToTree(paths) {
  // Null-prototype nodes: a selected path can carry a prototype-member name
  // (`additionalFields.toString` — a custom field really named `toString`), and
  // a plain `{}` would resolve `node.toString` to the inherited method, so the
  // `=== undefined` branch below would never create the sub-node and the path
  // would be silently dropped. `Object.create(null)` keeps own-keys-only.
  const tree = Object.create(null);
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
          node[segment] = Object.create(null);
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
  // `Object.hasOwn`, never `key in tree`: a mapped item can carry a data key
  // named like a prototype member (a custom `additionalFields` field called
  // `toString`/`constructor`/…), and `in` walks the prototype chain — an
  // unselected such key would leak into the response (and an object-valued one
  // would be recursed into `tree[key]`'s inherited method and mangled to `{}`).
  for (const key of Object.keys(value)) {
    if (Object.hasOwn(tree, key)) {
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
