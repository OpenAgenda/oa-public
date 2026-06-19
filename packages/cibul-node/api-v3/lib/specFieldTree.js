// Spec-derived field trees for the v3 `?fields=` selector.
//
// The selectable field universe and the strict nested-leaf keysets used to
// validate `?fields=` are derived ONCE, at import, directly from the OpenAPI
// contract (`@openagenda/api-spec/openapi.yaml`) — the single source of truth.
// This replaces the previous pair of hand-maintained sources (probing the
// mappers with `fieldNamesOf` for the top level, plus per-mapper `children`
// keysets): the schemas already enumerate every public field AND every nested
// sub-field under `additionalProperties: false`, so deriving from them makes
// the validation TOTAL and HONEST — strict leaves at every closed level, and
// the only best-effort nodes are exactly the schemas' real open containers
// (`additionalProperties: true` — the `additionalFields` bag, the localized
// text maps). The frontier is the contract's, not an accident of which fields
// happen to have a mapper allowlist.
//
// A drift test (90_unit_apiV3_selectFields.test.js) pins each derived tree
// against what its mapper actually emits, so the spec and the mappers can never
// silently disagree.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { parse } from 'yaml';

// A tree node is one of:
//   - `true`            -> OPEN: a free map (localized text), the additional-
//                          fields bag, or any `additionalProperties: true`
//                          object. Any deeper path under it is best-effort.
//   - a plain object    -> CLOSED: `{ subField: node }`. The next path segment
//                          MUST be one of its keys. An empty `{}` is a closed
//                          leaf (a scalar / enum) — it has no sub-fields, so any
//                          dotted descent into it is rejected.
export const OPEN = true;

// `{ type: 'null' }` or `{ type: ['null'] }` — the null arm of a nullable union.
function isNullBranch(branch) {
  if (!branch || typeof branch !== 'object') {
    return false;
  }
  const { type } = branch;
  return (
    type === 'null' || (Array.isArray(type) && type.every((t) => t === 'null'))
  );
}

// Unwrap the nullable/composition wrappers the contract uses so the structural
// reader below sees the underlying object schema:
//   - `$ref`                     -> the referenced schema
//   - `oneOf`/`anyOf: [X, null]` -> the non-null branch (X)
//   - `allOf: [X, …]`            -> the first composed branch (our `allOf`s are
//                                   a single `$ref` carrying sibling keywords)
// `seen` guards against a hypothetical `$ref` cycle (none today): a re-entered
// ref resolves to a closed leaf rather than looping forever.
function resolveSchema(schema, schemas, seen) {
  let current = schema;
  // Bounded unwrap loop; each iteration strips one wrapper.
  for (let guard = 0; guard < 20; guard += 1) {
    if (!current || typeof current !== 'object') {
      return current;
    }
    if (typeof current.$ref === 'string') {
      const name = current.$ref.replace('#/components/schemas/', '');
      if (seen.has(name)) {
        return null;
      }
      seen.add(name);
      current = schemas[name];
      continue;
    }
    const branches = current.oneOf ?? current.anyOf;
    if (Array.isArray(branches)) {
      current = branches.find((b) => !isNullBranch(b)) ?? branches[0];
      continue;
    }
    if (Array.isArray(current.allOf)) {
      [current] = current.allOf;
      continue;
    }
    return current;
  }
  return current;
}

// Build the tree node for a single schema (already a property value).
function nodeFor(schema, schemas, seen) {
  const s = resolveSchema(schema, schemas, new Set(seen));
  if (!s || typeof s !== 'object') {
    return {};
  }
  // Array: the selectable sub-fields are the element's, so descend into items
  // (a dotted `extIds.key` selects `key` of each element).
  if (s.items) {
    return nodeFor(s.items, schemas, seen);
  }
  // Open container: `additionalProperties` is `true` or a schema (a free map).
  // Its keys are open-ended (custom fields, language codes), so leaves under it
  // stay best-effort. A literal `properties` block alongside (e.g. the bag's
  // documented `tags`) does NOT make it closed — the bag can gain keys.
  if (s.additionalProperties && s.additionalProperties !== false) {
    return OPEN;
  }
  // Closed object: validate the next segment against these keys.
  if (s.properties && typeof s.properties === 'object') {
    const children = {};
    for (const [key, value] of Object.entries(s.properties)) {
      children[key] = nodeFor(value, schemas, seen);
    }
    return children;
  }
  // Scalar / enum / unconstrained leaf: no sub-fields.
  return {};
}

// Build the root field tree for a resource schema: `{ topField: node }`. The
// top-level keys ARE the selectable universe.
export function buildFieldTree(schemas, rootName) {
  const root = resolveSchema(
    { $ref: `#/components/schemas/${rootName}` },
    schemas,
    new Set(),
  );
  if (!root?.properties) {
    throw new Error(
      `spec schema "${rootName}" has no properties to derive fields from`,
    );
  }
  const tree = {};
  for (const [key, value] of Object.entries(root.properties)) {
    tree[key] = nodeFor(value, schemas, new Set([rootName]));
  }
  return tree;
}

// Load + parse the contract once. cibul-node already depends on `yaml` and on
// `@openagenda/api-spec`; `require.resolve` honors the package's `exports` map
// to locate the shipped `openapi.yaml`.
const require = createRequire(import.meta.url);
const specSource = readFileSync(
  require.resolve('@openagenda/api-spec/openapi.yaml'),
  'utf8',
);
const schemas = parse(specSource).components?.schemas ?? {};

// The selectable trees, per resource. The universe is the RICHEST shape (the
// `?fields=` selector is not gated by `detailed`):
//   - events    -> the full `Event` (single-get shape; supersets EventSummary)
//   - agendas   -> `AgendaDetailed` (the list's detailed projection — the
//                  richest the LIST can serve; the single-get is not a `?fields=`
//                  surface)
//   - locations -> the full `Location`
//   - /me       -> `MeAgendaItemDetailed` (agenda shape + private/role)
export const EVENT_FIELD_TREE = buildFieldTree(schemas, 'Event');
export const AGENDA_FIELD_TREE = buildFieldTree(schemas, 'AgendaDetailed');
export const LOCATION_FIELD_TREE = buildFieldTree(schemas, 'Location');
export const ME_FIELD_TREE = buildFieldTree(schemas, 'MeAgendaItemDetailed');
