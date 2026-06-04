// The operation index behind `search_docs`.
//
// Derived at load time from @openagenda/api-spec (the OpenAPI contract), so the
// catalogue, call signatures, parameters, response shapes and examples always
// track the contract — there is no generated artifact to commit or keep in sync.
// On top of the contract-derived data we merge a small, hand-curated SYNONYMS
// map: the search terms a human would type ("how many", "breakdown", "by id")
// that the contract doesn't carry. Relevance/search is a UX concern, not part of
// the API spec — so it lives here.
//
// Two tools, one round-trip: `search_docs` returns everything the LLM needs to
// write the `execute` body in a single shot (signature + typed params + enums +
// response shape + a runnable example), with detail MODULATED BY RANK so the
// payload stays bounded as the contract grows to dozens of operations — the top
// hits are rendered in full, the long tail compactly.

import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import MiniSearch from 'minisearch';

/**
 * @typedef {object} Param
 * @property {string} name
 * @property {'path'|'query'} in
 * @property {boolean} required
 * @property {string} type            Resolved type (`integer`, `string[]`, `Event`…).
 * @property {(string|number)[]} [enum]
 * @property {unknown} [default]
 * @property {number} [min]
 * @property {number} [max]
 * @property {string} description
 *
 * @typedef {object} ResponseShape
 * @property {string|null} root        Schema name of the 200 body.
 * @property {'list'|'object'} kind
 * @property {{name:string,type:string}[]} [fields]   Top-level fields (object kind).
 * @property {{variants:string[], fields:{name:string,type:string}[]}} [item]  List item (list kind).
 * @property {boolean} pagination
 *
 * @typedef {object} Operation
 * @property {string} id            operationId (e.g. "agendas.events.list").
 * @property {string} method        HTTP verb (GET…).
 * @property {string} path          URL template.
 * @property {string} call          How to invoke the method on the `oa` client.
 * @property {string} summary
 * @property {string} description
 * @property {string[]} scopes      OAuth scopes the operation requires.
 * @property {Param[]} params
 * @property {ResponseShape|null} response
 * @property {string} example       A runnable `oa.…` snippet (curated or skeleton).
 * @property {string[]} keywords    Cheap relevance matching for search_docs.
 */

// Resolve the contract from the @openagenda/api-spec dependency (which exports
// ./openapi.yaml), not by reaching across the workspace with a relative path —
// so it holds regardless of where the package sits on disk.
const specUrl = import.meta.resolve('@openagenda/api-spec/openapi.yaml');
const spec = parse(readFileSync(new URL(specUrl), 'utf8'));

const resolveRef = (ref) =>
  ref
    .replace(/^#\//, '')
    .split('/')
    .reduce((node, key) => node?.[key], spec);

const deref = (node) => (node && node.$ref ? resolveRef(node.$ref) : node);
const refName = (ref) => ref.split('/').pop();
const oneLine = (text) =>
  String(text || '')
    .trim()
    .replace(/\s+/g, ' ');

// Render a JSON Schema as a short, human type string (no recursion into
// sub-objects — `search_docs` describes the surface, `execute` runs the code).
function resolveType(schema) {
  if (!schema) return 'any';
  if (schema.$ref) return refName(schema.$ref);
  if (schema.oneOf) {
    return [...new Set(schema.oneOf.map(resolveType))].join(' | ');
  }
  // allOf is the JSON-Schema idiom for "this ref, plus refinements" (e.g.
  // `dateRange: allOf[$ref LocalizedString]`); name it by its meaningful members
  // rather than letting it fall through to `any`.
  if (schema.allOf) {
    const parts = [...new Set(schema.allOf.map(resolveType))].filter(
      (t) => t !== 'any',
    );
    return parts.length ? parts.join(' & ') : 'any';
  }
  let { type } = schema;
  let nullable = false;
  if (Array.isArray(type)) {
    nullable = type.includes('null');
    type = type.find((t) => t !== 'null') || 'any';
  }
  const base = type === 'array' ? `${resolveType(schema.items || {})}[]` : type || 'any';
  return nullable && base !== 'null' ? `${base} | null` : base;
}

// Structured params, path params INCLUDED (the contract carries both; the LLM
// needs the path shape too). Enums/default/min/max are lifted from the schema
// (arrays carry them under `items`) so the renderer can surface them inline.
function deriveParams(op) {
  return (op.parameters || []).map(deref).map((p) => {
    const schema = p.schema || {};
    const enumValues = schema.enum || schema.items?.enum;
    /** @type {Param} */
    const param = {
      name: p.name,
      in: p.in,
      required: !!p.required,
      type: resolveType(schema),
      description: oneLine(p.description),
    };
    if (enumValues) param.enum = enumValues;
    if (schema.default !== undefined) param.default = schema.default;
    if (schema.minimum !== undefined) param.min = schema.minimum;
    if (schema.maximum !== undefined) param.max = schema.maximum;
    return param;
  });
}

const topLevelFields = (schema) =>
  Object.entries(schema?.properties || {}).map(([name, s]) => ({
    name,
    type: resolveType(s),
  }));

// Resolve the 200 body into a shallow shape. List endpoints wrap their rows in
// `data: array<oneOf[Summary, Detailed]>` + `pagination`; we surface the DEFAULT
// (summary) variant's fields and note the `detailed=true` upgrade. Everything
// else is rendered as a flat top-level field list.
/**
 * @param {any} op
 * @returns {ResponseShape | null}
 */
function deriveResponse(op) {
  const body = op.responses?.['200']?.content?.['application/json']?.schema;
  if (!body) return null;
  const root = body.$ref ? refName(body.$ref) : null;
  const schema = deref(body);
  const props = schema?.properties || {};
  const { data } = props;
  if (data?.type === 'array' && Array.isArray(data.items?.oneOf)) {
    const variants = data.items.oneOf.map((v) => resolveType(v));
    return {
      root,
      kind: 'list',
      item: { variants, fields: topLevelFields(deref(data.items.oneOf[0])) },
      pagination: !!props.pagination,
    };
  }
  return {
    root,
    kind: 'object',
    fields: topLevelFields(schema),
    pagination: !!props.pagination,
  };
}

// Words too generic to help relevance matching.
const STOP = new Set([
  'the',
  'a',
  'an',
  'of',
  'to',
  'for',
  'and',
  'or',
  'in',
  'on',
  'by',
  'with',
  'this',
  'that',
  'its',
  'each',
  'all',
  'only',
  'when',
  'from',
  'as',
  'is',
  'are',
  'be',
  'it',
  'you',
  'your',
  'returns',
  'return',
  'one',
  'per',
]);

function keywordsFor(operationId, summary, paramNames) {
  const fromId = operationId.split(/[./]/);
  const fromSummary = String(summary || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
  return [
    ...new Set(
      [...fromId, ...fromSummary, ...paramNames]
        .map((word) => String(word).toLowerCase())
        .filter(Boolean),
    ),
  ];
}

// Curated search synonyms, merged on top of the derived keywords. Keyed by
// operationId. Keep these to the words a user would actually type — the spec
// already contributes the structural keywords (id segments, summary, params).
const SYNONYMS = {
  'agendas.list': ['list', 'agendas', 'directory', 'catalogue', 'catalog'],
  'agendas.get': ['get', 'agenda', 'detail', 'single', 'one', 'by id', 'uid'],
  'agendas.events.list': [
    'list',
    'events',
    'filter',
    'paginate',
    'cursor',
    'when',
    'where',
    'city',
    'date',
  ],
  'agendas.events.get': [
    'get',
    'event',
    'detail',
    'single',
    'one',
    'by id',
    'uid',
  ],
  'agendas.events.facets': [
    'facets',
    'aggregate',
    'count',
    'group',
    'stats',
    'histogram',
    'how many',
    'breakdown',
  ],
};

// A concrete placeholder value for a scalar type, for auto-derived skeletons.
const SCALAR_PLACEHOLDER = {
  integer: '123',
  number: '123',
  boolean: 'true',
  string: "'…'",
};

function placeholder(param) {
  // Resolve the inner (scalar) value first, THEN wrap — an enum lifted from
  // `items.enum` belongs to an array param, so it must still be wrapped in `[]`.
  const value = param.enum
    ? JSON.stringify(param.enum[0])
    : SCALAR_PLACEHOLDER[param.type.replace(/\[\]$/, '')] ?? '{}';
  return param.type.endsWith('[]') ? `[${value}]` : value;
}

// Auto-derived example for any op WITHOUT a curated `x-codeSamples`: the call
// with required params filled (enum → first value), the {data,error} check, and
// a return. Guarantees every op carries a runnable shape without curating each.
// Exported so the skeleton path is unit-tested even when every current op is
// curated (and so never exercises it through exampleFor).
export function skeletonExample(operationId, params) {
  const path = params.filter((p) => p.in === 'path');
  const query = params.filter((p) => p.in === 'query' && p.required);
  const args = [];
  if (path.length) {
    args.push(
      `path: { ${path.map((p) => `${p.name}: ${placeholder(p)}`).join(', ')} }`,
    );
  }
  if (query.length) {
    args.push(
      `query: { ${query.map((p) => `${p.name}: ${placeholder(p)}`).join(', ')} }`,
    );
  }
  const arg = args.length ? `{ ${args.join(', ')} }` : '';
  return [
    `const { data, error } = await oa.${operationId}(${arg});`,
    'if (error) throw error;',
    'return data;',
  ].join('\n');
}

// Prefer a curated TypeScript `x-codeSamples` sample (co-located with the op in
// the contract, also consumable by Scalar); fall back to an auto skeleton.
function exampleFor(op, operationId, params) {
  const samples = op['x-codeSamples'];
  const curated = Array.isArray(samples)
    ? samples.find((s) => /^(ts|typescript|js|javascript)$/i.test(s?.lang))
    : null;
  return curated?.source?.trim() || skeletonExample(operationId, params);
}

// Derive the catalogue from the contract. Kept in spec declaration order (list
// before get within each resource): deterministic, reads naturally, and gives
// search a sensible tie-break.
function deriveOperations() {
  /** @type {Operation[]} */
  const operations = [];

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (!op || typeof op !== 'object' || !op.operationId) {
        continue;
      }

      const params = deriveParams(op);
      const pathNames = params
        .filter((p) => p.in === 'path')
        .map((p) => p.name);
      const hasQuery = params.some((p) => p.in === 'query');

      const args = [];
      if (pathNames.length) args.push(`path: { ${pathNames.join(', ')} }`);
      if (hasQuery) args.push('query');
      const argList = args.length ? `{ ${args.join(', ')} }` : '';
      const call = `oa.${op.operationId}(${argList})`;

      const scopes = (op.security || []).flatMap((req) => req.oauth2 || []);
      const synonyms = SYNONYMS[op.operationId] ?? [];
      const keywords = keywordsFor(
        op.operationId,
        op.summary,
        params.filter((p) => p.in === 'query').map((p) => p.name),
      );

      operations.push({
        id: op.operationId,
        method: method.toUpperCase(),
        path,
        call,
        summary: oneLine(op.summary),
        description: oneLine(op.description),
        scopes,
        params,
        response: deriveResponse(op),
        example: exampleFor(op, op.operationId, params),
        keywords: [...new Set([...keywords, ...synonyms])],
      });
    }
  }

  return operations;
}

/** @type {Operation[]} */
export const OPERATIONS = deriveOperations();

// The zod validators exposed as `schemas.z<Name>` inside `execute` (Hey API
// names every component schema `Event` → `zEvent`). Derived from the contract so
// the list tracks it without curation.
export const SCHEMA_VALIDATORS = Object.keys(spec.components?.schemas || {})
  .map((name) => `z${name}`)
  .sort();

// Full-text index over the catalogue. Boosts the operationId and summary, plus
// the curated keywords. Built once at load.
//
// Deliberately NOT indexing the prose `description`: descriptions cross-
// reference OTHER operationIds (e.g. the facets description mentions
// `agendas.events.list`), which would leak relevance credit between operations
// and distort ranking. The id/summary/params/enums/keywords surface is what a
// query should match.
//
// `fuzzy` is gated to LONG terms only: a blanket fuzzy distance turns short
// words into false hits (`show`→`how`, `events`→`event`), surfacing the wrong
// operation for plain-language queries. Prefix matching covers partial words;
// fuzzy is reserved for typos in longer tokens where an edit is unambiguous.
const miniSearch = new MiniSearch({
  fields: ['id', 'summary', 'params', 'enums', 'keywords'],
  searchOptions: {
    boost: { id: 3, summary: 2, keywords: 2 },
    fuzzy: (term) => (term.length > 6 ? 0.2 : false),
    prefix: true,
    combineWith: 'OR',
  },
});
miniSearch.addAll(
  OPERATIONS.map((op) => ({
    id: op.id,
    summary: op.summary,
    params: op.params.map((p) => p.name).join(' '),
    enums: op.params.flatMap((p) => p.enum || []).join(' '),
    keywords: op.keywords.join(' '),
  })),
);

/**
 * Rank operations for a query. Empty query or no match → ALL operations (in
 * spec order) so search_docs is never empty — the LLM always sees the surface.
 * @param {string} query
 * @returns {Operation[]}
 */
export function searchOperations(query) {
  const q = String(query ?? '').trim();
  if (!q) return OPERATIONS;
  const results = miniSearch.search(q);
  if (!results.length) return OPERATIONS;
  const byId = new Map(OPERATIONS.map((op) => [op.id, op]));
  return /** @type {Operation[]} */ (
    results.map((r) => byId.get(r.id)).filter(Boolean)
  );
}

// How many top hits get the full, detailed render before the long tail is
// compacted. Keeps the payload bounded as the catalogue grows.
const RICH_RANK_CUTOFF = 3;

// Render a param verbatim: when an op is surfaced as a top hit, the LLM needs
// its full semantics to call it correctly — depth-by-rank bounds the payload by
// op COUNT (only the top few render rich), never by truncating a single op.
function renderParamLine(p) {
  const meta = [];
  if (p.enum) meta.push(`one of: ${p.enum.join(', ')}`);
  if (p.default !== undefined) meta.push(`default ${JSON.stringify(p.default)}`);
  if (p.min !== undefined || p.max !== undefined) {
    meta.push(`range ${p.min ?? '−∞'}…${p.max ?? '∞'}`);
  }
  const tail = [p.description, meta.length ? `[${meta.join('; ')}]` : '']
    .filter(Boolean)
    .join(' ');
  return `- \`${p.name}\` (${p.type}${p.required ? ', required' : ''})${tail ? ` — ${tail}` : ''}`;
}

function renderResponse(response) {
  if (!response) return '';
  // An inline (non-$ref) 200 body has no schema name — name it by kind rather
  // than interpolating a literal `null`.
  const root = response.root ?? (response.kind === 'list' ? 'List' : 'Object');
  if (response.kind === 'list') {
    const [summary, detailed] = response.item.variants;
    const upgrade = detailed
      ? ` (+ \`${detailed}\` fields when \`detailed=true\`)`
      : '';
    const fields = response.item.fields.map((f) => f.name).join(', ');
    const head = `Response: \`${root}\` → { data: \`${summary}\`[]${upgrade}, pagination }`;
    return fields ? `${head}\n\`${summary}\` fields: ${fields}` : head;
  }
  const fields = response.fields.map((f) => f.name).join(', ');
  return fields
    ? `Response: \`${root}\` → { ${fields} }`
    : `Response: \`${root}\``;
}

// A param is "notable" (worth a full line in the rich block) when it carries
// signal the LLM can't guess: required, an enum, or a default/range. Plain
// optional filters are compacted to a names line so the block stays scannable.
const isNotable = (p) =>
  p.required
  || p.enum
  || p.default !== undefined
  || p.min !== undefined
  || p.max !== undefined;

function renderRich(op) {
  const notable = op.params.filter(isNotable);
  const plain = op.params.filter((p) => !isNotable(p));
  const lines = [
    `### ${op.id}`,
    `\`${op.call}\` — ${op.method} ${op.path}`,
    op.summary,
  ];
  if (op.description) lines.push('', op.description);
  if (notable.length) {
    lines.push('', 'Parameters:', ...notable.map(renderParamLine));
  }
  if (plain.length) {
    lines.push(
      '',
      `Other optional parameters: ${plain.map((p) => p.name).join(', ')}.`,
    );
  }
  const response = renderResponse(op.response);
  if (response) lines.push('', response);
  lines.push('', 'Example:', '```ts', op.example, '```');
  return lines.join('\n');
}

const renderCompact = (op) => `### ${op.id} — ${op.summary}\n\`${op.call}\``;

/**
 * Render one operation, modulated by its rank: the top hits get the full block
 * (params, enums, response shape, example), the long tail a one-line entry.
 * @param {Operation} op
 * @param {number} [rank]   0-based position in the result list.
 */
export function renderOperation(op, rank = 0) {
  return rank < RICH_RANK_CUTOFF ? renderRich(op) : renderCompact(op);
}

const SCHEMAS_FOOTER = 'Validators: a `schemas` namespace of zod validators is available in `execute` '
  + 'to parse payloads (e.g. `schemas.zEvent.parse(data)`). Available: '
  + `${SCHEMA_VALIDATORS.join(', ')}.`;

/**
 * Render a full search_docs response: each hit by rank, plus the validators
 * footer. Single round-trip — everything the LLM needs to call `execute`.
 * @param {Operation[]} hits
 */
export function renderSearch(hits) {
  if (!hits.length) return SCHEMAS_FOOTER;
  const body = hits.map((op, i) => renderOperation(op, i)).join('\n\n---\n\n');
  return `${body}\n\n---\n\n${SCHEMAS_FOOTER}`;
}
