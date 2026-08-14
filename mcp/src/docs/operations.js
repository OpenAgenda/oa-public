// The operation index behind `search_docs`.
//
// Derived at load time from @openagenda/api-spec (the OpenAPI contract), so the
// catalogue, call signatures, parameters, response shapes and examples always
// track the contract — there is no generated artifact to commit or keep in sync.
// The search terms a human would type ("how many", "breakdown", "by id") that
// the structural fields don't carry travel WITH each operation in the contract,
// as an `x-synonyms` vendor extension (alongside the `x-codeSamples` examples) —
// so adding a route is a single-file edit and there is no operationId list to
// keep in sync here.
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
 * @property {Record<string, string>} [enumDescriptions]  Per-value labels (x-enum-descriptions).
 * @property {unknown} [default]
 * @property {number} [min]
 * @property {number} [max]
 * @property {string} description
 *
 * @typedef {object} Field
 * @property {string} name
 * @property {string} type
 * @property {string} description     The property's own description ('' when none).
 *
 * @typedef {object} ResponseShape
 * @property {string|null} root        Schema name of the success body.
 * @property {'list'|'object'} kind
 * @property {Field[]} [fields]        Top-level fields (object kind).
 * @property {{variants:string[], fields:Field[]}} [item]  List item (list kind).
 * @property {boolean} pagination
 *
 * @typedef {object} RequestShape
 * @property {string|null} root       Schema name of the request body.
 * @property {string} contentType     Media type it is sent as.
 * @property {boolean} required
 * @property {Field[]} fields         Top-level fields ([] for an opaque body).
 *
 * @typedef {object} Operation
 * @property {string} id            operationId (e.g. "agendas.events.list").
 * @property {string} method        HTTP verb (GET…).
 * @property {string} path          URL template.
 * @property {string} call          How to invoke it: an `oa` client call, or
 *                                 the wire signature when not sdkCallable.
 * @property {string} summary
 * @property {string} description
 * @property {string[]} scopes      OAuth scopes the operation requires.
 * @property {Param[]} params
 * @property {RequestShape|null} request   Body the operation expects (null when it takes none).
 * @property {boolean} sdkCallable  False when the contract authorizes it outside the `oa` client.
 * @property {string} exampleLang   Fence language for `example` ("ts", "shell"),
 *                                 '' when none applies.
 * @property {ResponseShape|null} response
 * @property {string[]} componentRefs  Component schemas the success body references (transitive, discovery order).
 * @property {string} example       A runnable snippet (curated or skeleton); not
 *                                 an `oa.…` call when not sdkCallable.
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

// Resolve a (possibly wrapped) schema down to the node that actually carries
// the `enum` — through $ref, array `items`, and allOf/oneOf/anyOf members —
// so the enum values and their x-enum-descriptions labels surface no matter how
// the parameter is modelled (`sort`'s inline enum, `status`'s `items: $ref`, a
// direct `$ref` to a shared enum, an `allOf: [{$ref}]` like the `state` field,
// or a nullable `type: [integer, 'null']` enum). Returns the enum-bearing
// schema, or undefined. `seen` guards against $ref cycles.
export function enumSchemaOf(schema, seen = new Set()) {
  if (!schema || typeof schema !== 'object') return undefined;
  if (schema.$ref) {
    if (seen.has(schema.$ref)) return undefined;
    seen.add(schema.$ref);
    return enumSchemaOf(resolveRef(schema.$ref), seen);
  }
  if (schema.enum) return schema;
  if (schema.items) return enumSchemaOf(schema.items, seen);
  for (const key of ['allOf', 'oneOf', 'anyOf']) {
    if (Array.isArray(schema[key])) {
      for (const member of schema[key]) {
        const found = enumSchemaOf(member, seen);
        if (found) return found;
      }
    }
  }
  return undefined;
}
const oneLine = (text) =>
  String(text || '')
    .trim()
    .replace(/\s+/g, ' ');

// Render a JSON Schema as a short, human type string (no recursion into
// sub-objects — `search_docs` describes the surface, `execute` runs the code).
// A $ref keeps its component name everywhere — params and responses alike:
// every name a card renders is defined in the Components section of the same
// search_docs response, so the name is never opaque, and the same field reads
// identically as a filter (`status (EventStatus[])`), as a response field
// (`status (EventStatus)`) and as a validator (`schemas.zEventStatus`). Params
// additionally inline their passable values on the param line, so writing a
// call never requires the jump.
function resolveType(schema) {
  if (!schema) return 'any';
  if (schema.$ref) {
    return refName(schema.$ref);
  }
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
  // Parenthesise a union before suffixing `[]`, or `FacetName | FacetSpec[]`
  // reads as "one name, or an array of specs" — and the LLM sends the scalar.
  const item = type === 'array' ? resolveType(schema.items || {}) : '';
  const base = type === 'array'
    ? `${item.includes(' | ') ? `(${item})` : item}[]`
    : type || 'any';
  return nullable && base !== 'null' ? `${base} | null` : base;
}

// Structured params, path params INCLUDED (the contract carries both; the LLM
// needs the path shape too). Enums/default/min/max are lifted from the schema
// (arrays carry them under `items`) so the renderer can surface them inline.
function deriveParams(op) {
  return (op.parameters || []).map(deref).map((p) => {
    const schema = p.schema || {};
    // The enum (and its x-enum-descriptions labels) may sit on the param schema
    // directly (`sort`), under array `items`, behind a $ref to a shared enum, or
    // wrapped in allOf/oneOf/anyOf — enumSchemaOf resolves through all of them.
    // The labels travel WITH the enum, so a renamed/extended enum stays in sync.
    const enumSchema = enumSchemaOf(schema);
    const enumValues = enumSchema?.enum;
    const enumDescriptions = enumSchema?.['x-enum-descriptions'];
    /** @type {Param} */
    const param = {
      name: p.name,
      in: p.in,
      required: !!p.required,
      type: resolveType(schema),
      description: oneLine(p.description),
    };
    if (enumValues) param.enum = enumValues;
    if (enumDescriptions) param.enumDescriptions = enumDescriptions;
    if (schema.default !== undefined) param.default = schema.default;
    if (schema.minimum !== undefined) param.min = schema.minimum;
    if (schema.maximum !== undefined) param.max = schema.maximum;
    return param;
  });
}

// Fields carry the property's OWN description only: a bare `$ref` property
// reads as its component, whose semantics live in the Components section, not
// repeated on every field that uses it.
const topLevelFields = (schema) =>
  Object.entries(schema?.properties || {}).map(([name, s]) => ({
    name,
    type: resolveType(s),
    description: oneLine(s.description),
  }));

// Names of every component schema transitively referenced by `schema`, in
// discovery order. Drives the Components section: each named type a rich card
// surfaces — in its response shape OR its param types — gets defined once in
// the same search_docs response, so no rendered name dangles. `seen` guards
// against $ref cycles.
function collectComponentRefs(schema, names = [], seen = new Set()) {
  if (!schema || typeof schema !== 'object') return names;
  if (schema.$ref) {
    if (seen.has(schema.$ref)) return names;
    seen.add(schema.$ref);
    if (schema.$ref.startsWith('#/components/schemas/')) {
      const name = refName(schema.$ref);
      if (!names.includes(name)) names.push(name);
    }
    return collectComponentRefs(resolveRef(schema.$ref), names, seen);
  }
  for (const key of ['allOf', 'oneOf', 'anyOf']) {
    for (const member of schema[key] || []) {
      collectComponentRefs(member, names, seen);
    }
  }
  collectComponentRefs(schema.items, names, seen);
  for (const s of Object.values(schema.properties || {})) {
    collectComponentRefs(s, names, seen);
  }
  if (typeof schema.additionalProperties === 'object') {
    collectComponentRefs(schema.additionalProperties, names, seen);
  }
  return names;
}

// The JSON body an operation answers with on success. NOT hardcoded to 200: a
// pure creation answers 201 only (`agendas.events.create`), and it would
// otherwise render with no response shape at all — the one hole in the
// catalogue. Lowest 2xx wins, so the by-ext upserts (200 update / 201 create,
// same `Event` either way) keep reading as their 200.
function successBody(op) {
  const codes = Object.keys(op.responses || {})
    .filter((code) => /^2\d\d$/.test(code))
    .sort();
  for (const code of codes) {
    // `deref` because a response may be written as a $ref into
    // `#/components/responses/*` — the convention every 4xx in the contract
    // already follows. Reading `.content` off the unresolved $ref would find
    // nothing and silently drop the shape, which is the failure this whole
    // function exists to remove.
    const schema = deref(op.responses[code])?.content?.['application/json']
      ?.schema;
    if (schema) return schema;
  }
  return undefined;
}

// Pick the ONE media type the card documents. Matched on `json` as a word, not
// on the exact string: `application/merge-patch+json` is the natural type for
// the patch routes and `; charset=utf-8` is always legal, and an exact match
// would fall through to whatever key came first — documenting a binary body for
// a JSON endpoint. `componentRefsFor` resolves through here too, so the shape
// the card names and the components it defines can never disagree.
const JSON_MEDIA = /\bjson\b/;
function requestContent(op) {
  const requestBody = deref(op.requestBody);
  const content = requestBody?.content;
  if (!content) return null;
  const types = Object.keys(content);
  const contentType = types.find((t) => JSON_MEDIA.test(t)) ?? types[0];
  if (!contentType) return null;
  return { requestBody, contentType, schema: content[contentType]?.schema };
}

// Every component an operation's card can name: its success body (the shape the
// LLM reads), the body it must SEND, and its param schemas — a $ref'd filter
// enum like `status (EventStatus[])` needs its definition too. One shared `seen`
// so a component reached from several sides is collected once.
//
// This traversal is the SAME one that produces the types the card renders, so
// "every type name on a card is defined in that payload" holds by construction —
// there is nothing to parse and nothing to keep in sync.
//
// Descriptions are deliberately NOT scanned for component names. The prose does
// cite shapes ("attach with `image: { ref }` (see `ImageInput`)", "an `ExtId`
// mapping"), and chasing those citations was tried: it cost a regex over free
// text, two rounds of bugs, and 7-22% of payload. It bought nothing, because
// every shape a caller needs to USE an operation is already reachable from that
// operation — `ImageInput` lands on the event-write card through
// `EventInput.image`, structurally. What the citations point at is another
// operation's shapes, which are defined on THAT operation's card, where the
// caller will be when they need them. Pulling them here imports one card's
// payload into another.
function componentRefsFor(op) {
  const names = [];
  const seen = new Set();
  const params = (op.parameters ?? []).map(deref);
  collectComponentRefs(successBody(op), names, seen);
  collectComponentRefs(requestContent(op)?.schema, names, seen);
  for (const p of params) collectComponentRefs(p.schema, names, seen);
  return names;
}

// The body an operation expects. JSON is preferred when a route offers several
// media types; a multipart upload has no component to name, so it surfaces its
// content type and an empty field list rather than being dropped entirely.
/**
 * @param {any} op
 * @returns {RequestShape | null}
 */

function deriveRequest(op) {
  const selected = requestContent(op);
  if (!selected) return null;
  const { requestBody, contentType, schema } = selected;
  return {
    root: schema?.$ref ? refName(schema.$ref) : null,
    contentType,
    required: !!requestBody.required,
    fields: topLevelFields(deref(schema)),
  };
}

// The `oa` client authenticates with the schemes the SDK carries (an API key or
// an OAuth token). An operation secured by anything else CANNOT be reached
// through it — `uploads.staged` takes a single-use `X-Upload-Ticket` instead,
// and its description says so in as many words ("Call it with a plain HTTPS
// POST, NOT through the typed API client"). Derived from the security block
// rather than keyed on the operationId, so a second such route needs no edit.
const SDK_AUTH_SCHEMES = new Set(['bearerAuth', 'oauth2']);
function isSdkCallable(op) {
  const requirements = op.security ?? spec.security ?? [];
  // `security: []` is the OpenAPI idiom for "this route needs no auth", so the
  // client can call it. Only a requirement it cannot SATISFY puts the route out
  // of reach — the empty list means no requirement at all, not an impossible one.
  if (!requirements.length) return true;
  return requirements.some((requirement) =>
    Object.keys(requirement).some((scheme) => SDK_AUTH_SCHEMES.has(scheme)));
}

// Resolve the success body into a shallow shape. List endpoints wrap their
// rows in `data: array<oneOf[Summary, Detailed]>` + `pagination`; we surface
// the DEFAULT (summary) variant's fields and note the `detailed=true` upgrade.
// Everything else is rendered as a flat top-level field list.
/**
 * @param {any} op
 * @returns {ResponseShape | null}
 */
function deriveResponse(op) {
  const body = successBody(op);
  if (!body) return null;
  const root = body.$ref ? refName(body.$ref) : null;
  const schema = deref(body);
  const props = schema?.properties || {};
  const { data } = props;
  if (data?.type === 'array' && Array.isArray(data.items?.oneOf)) {
    // Normalize variants to [summary, detailed] regardless of contract order:
    // the summary branch is the one with the smaller property set (detailed is
    // a strict superset). The spec lists the DETAILED branch first (the
    // generated zod client returns the first union match and strips unknown
    // keys), while these docs lead with the default (summary) shape — so the
    // order must be derived structurally, not positionally.
    const branches = data.items.oneOf
      .map((v) => ({ name: resolveType(v), schema: deref(v) }))
      .sort(
        (a, b) =>
          Object.keys(a.schema?.properties ?? {}).length
          - Object.keys(b.schema?.properties ?? {}).length,
      );
    return {
      root,
      kind: 'list',
      item: {
        variants: branches.map((b) => b.name),
        fields: topLevelFields(branches[0].schema),
      },
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
    : (SCALAR_PLACEHOLDER[param.type.replace(/\[\]$/, '')] ?? '{}');
  return param.type.endsWith('[]') ? `[${value}]` : value;
}

// Auto-derived example for any op WITHOUT a curated `x-codeSamples`: the call
// with required params filled (enum → first value), the {data,error} check, and
// a return. Guarantees every op carries a runnable shape without curating each.
// Exported so the skeleton path is unit-tested even when every current op is
// curated (and so never exercises it through exampleFor).
/**
 * @param {string} operationId
 * @param {Param[]} params
 * @param {RequestShape | null} [request]
 */
export function skeletonExample(operationId, params, request = null) {
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
  if (request) {
    // Name the component rather than invent a literal: a half-guessed body is
    // what an LLM copies wholesale. The shape is not hidden — the card names it
    // one line above and the Components section defines it field by field,
    // required markers included.
    args.push(`body: ${request.root ? `/* ${request.root} */ {}` : '{}'}`);
  }
  const arg = args.length ? `{ ${args.join(', ')} }` : '';
  return [
    `const { data, error } = await oa.${operationId}(${arg});`,
    'if (error) throw error;',
    'return data;',
  ].join('\n');
}

// Prefer a curated `x-codeSamples` sample (co-located with the op in the
// contract, also consumable by Scalar); fall back to an auto skeleton.
//
// A curated sample in ANOTHER language is still the authoritative way to call
// the route, so it is kept and rendered under its own fence rather than
// discarded. Dropping it is how `uploads.staged` — whose only sample is the
// curl invocation its description mandates — ended up advertising
// `await oa.uploads.staged()`, the exact call the contract forbids, with no
// ticket, no file and no body.
const TS_LANGS = /^(ts|typescript|js|javascript)$/i;

// Fence languages we are willing to emit. The contract's `lang` is free text
// (Scalar renders it as a label), so a typo, a multi-word value or an omitted
// key would otherwise land verbatim after the backticks — ```undefined and
// friends. Anything unrecognised degrades to no language rather than a broken
// fence.
const FENCE_LANGS = new Set([
  'shell',
  'bash',
  'curl',
  'http',
  'json',
  'python',
]);
const fenceLang = (lang) => {
  if (TS_LANGS.test(lang)) return 'ts';
  const normalized = String(lang ?? '').toLowerCase();
  return FENCE_LANGS.has(normalized) ? normalized : '';
};

function exampleFor(op, operationId, params, request, sdkCallable, call) {
  const samples = Array.isArray(op['x-codeSamples']) ? op['x-codeSamples'] : [];
  const ts = samples.find((s) => TS_LANGS.test(s?.lang));
  // For an SDK-callable route the TypeScript sample is the ONE that matches
  // what this payload frames — the `oa` client, run by an `execute` sandbox
  // that only speaks JavaScript. A curated Python or Shell sample there
  // documents a different way in, so it must not replace the call; the skeleton
  // is the better answer. When the SDK cannot reach the route at all there is
  // no call to fall back to, so any curated sample wins and a skeleton would
  // be a fabrication.
  const curated = sdkCallable ? ts : (ts ?? samples[0]);
  const source = curated?.source?.trim();
  if (source) return { source, lang: fenceLang(curated.lang) };
  // No sample and no SDK call: emit the wire signature rather than an `oa.*`
  // skeleton that cannot authenticate — the exact bug `uploads.staged` had,
  // which it escaped only by happening to carry a curl sample.
  if (!sdkCallable) return { source: call, lang: '' };
  return { source: skeletonExample(operationId, params, request), lang: 'ts' };
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

      const request = deriveRequest(op);
      const sdkCallable = isSdkCallable(op);

      const args = [];
      if (pathNames.length) args.push(`path: { ${pathNames.join(', ')} }`);
      if (hasQuery) args.push('query');
      if (request) args.push('body');
      const argList = args.length ? `{ ${args.join(', ')} }` : '';
      // An operation the SDK cannot authenticate is named by its wire call, not
      // by an `oa.*` invocation that would fail — the signature is the first
      // line of its card and the LLM reads it as the way in.
      const call = sdkCallable
        ? `oa.${op.operationId}(${argList})`
        : `${method.toUpperCase()} ${path}`;

      const scopes = (op.security || []).flatMap((req) => req.oauth2 || []);
      // Hand-curated search synonyms travel WITH the operation in the contract
      // (`x-synonyms`, alongside `x-codeSamples`) — one place to think about when
      // adding a route. Keep them to the plain-language words a user types that
      // the contract doesn't already carry (the id segments, summary and query
      // param names are derived into `keywords` below — no need to repeat them).
      const synonyms = op['x-synonyms'] ?? [];
      const keywords = keywordsFor(
        op.operationId,
        op.summary,
        params.filter((p) => p.in === 'query').map((p) => p.name),
      );

      const { source: example, lang: exampleLang } = exampleFor(
        op,
        op.operationId,
        params,
        request,
        sdkCallable,
        call,
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
        request,
        sdkCallable,
        response: deriveResponse(op),
        componentRefs: componentRefsFor(op),
        example,
        exampleLang,
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
//
// Plain-language queries are addressed to an assistant ("show me the events",
// "give me the list of events"), so they arrive padded with filler. BM25 ranks
// by RARITY, which makes filler dangerous the moment it collides with a term
// this catalogue happens to hold exactly once — a singleton's IDF, times a
// field boost, buries the word the user actually meant. Two independent
// sources of that collision, hence the two guards below; neither covers the
// other, and dropping either lets the wrong operation win again (measured).
//
//   1. `processTerm` drops STOP words from the indexed SUMMARY. Only
//      `me.agendas.list` is summarised "List the agendas you are a member of",
//      so "the" and "you" were singleton terms in a x2-boosted field: any
//      query containing them ranked that one operation first. STOP already
//      existed for the derived `keywords`; the raw summary was indexed
//      verbatim, which is the whole bug. Applied to `summary` ALONE — the
//      curated `x-synonyms` deliberately contain stop words as signal ("by
//      id", "by ext", "one"), and stripping those would break the very
//      queries they were written for.
//
//   2. `boostTerm` damps the 1-2 character tokens of a multi-word query, the
//      glue no stop-list can enumerate ("show ME events"). Here the singleton
//      is STRUCTURAL, not prose: "me" is the namespace segment of exactly one
//      operationId, in the x3-boosted `id` field, so no amount of summary
//      filtering reaches it. Damping only LOWERS glue rather than dropping it,
//      so the curated 2-letter synonyms ("my agendas" -> me.agendas.list) keep
//      winning on their own merit.
const GLUE_TERM_MAX_LENGTH = 2;
const GLUE_TERM_WEIGHT = 0.35;

const miniSearch = new MiniSearch({
  fields: ['id', 'summary', 'params', 'enums', 'keywords'],
  processTerm: (term, fieldName) => {
    const t = term.toLowerCase();
    return fieldName === 'summary' && STOP.has(t) ? null : t;
  },
  searchOptions: {
    boost: { id: 3, summary: 2, keywords: 2 },
    fuzzy: (term) => (term.length > 6 ? 0.2 : false),
    boostTerm: (term) =>
      (term.length <= GLUE_TERM_MAX_LENGTH ? GLUE_TERM_WEIGHT : 1),
    prefix: true,
    combineWith: 'OR',
  },
});
miniSearch.addAll(
  OPERATIONS.map((op) => ({
    id: op.id,
    summary: op.summary,
    params: op.params.map((p) => p.name).join(' '),
    // Index the enum values AND their labels, so a query like "cancelled" or
    // "relevance" matches the operation carrying that enum.
    enums: op.params
      .flatMap((p) => [
        ...p.enum || [],
        ...p.enumDescriptions ? Object.values(p.enumDescriptions) : [],
      ])
      .join(' '),
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

// `value = label` (not `value (label)`): the `=` keeps the raw value
// unmistakable from its gloss — the LLM sends/reads `1`, never `"Scheduled"`.
// A value missing from the labels map falls back to the bare value (still a
// usable value), never a literal `?` gloss.
function enumGloss(values, labels) {
  if (!labels) {
    // Bare values render raw (passed, upcoming) — except null, which Array
    // joining would silently turn into an empty string.
    return values.map((v) => (v === null ? 'null' : v)).join(', ');
  }
  return values
    .map((v) => {
      const label = labels[v] ?? labels[String(v)];
      return label ? `${JSON.stringify(v)} = ${label}` : JSON.stringify(v);
    })
    .join(', ');
}

// Render a param verbatim: when an op is surfaced as a top hit, the LLM needs
// its full semantics to call it correctly — depth-by-rank bounds the payload by
// op COUNT (only the top few render rich), never by truncating a single op.
function renderParamLine(p) {
  const meta = [];
  if (p.enum) {
    meta.push(`one of: ${enumGloss(p.enum, p.enumDescriptions)}`);
  }
  if (p.default !== undefined) meta.push(`default ${JSON.stringify(p.default)}`);
  if (p.min !== undefined || p.max !== undefined) {
    meta.push(`range ${p.min ?? '−∞'}…${p.max ?? '∞'}`);
  }
  const tail = [p.description, meta.length ? `[${meta.join('; ')}]` : '']
    .filter(Boolean)
    .join(' ');
  return `- \`${p.name}\` (${p.type}${p.required ? ', required' : ''})${tail ? ` — ${tail}` : ''}`;
}

// A response field line: `- name (Type) — its own description`. The type names
// are join keys: every component named here is defined in the Components
// section of the same search_docs response (or is the inline root itself).
const renderFieldLine = (f) =>
  `- ${f.name} (${f.type})${f.description ? ` — ${f.description}` : ''}`;

// One definition per named type the rich cards reference. Enum components get
// their decode table — the response-side complement of the params' inline
// `one of:` lists (an LLM reading `status: 6` off an `execute` result must be
// able to decode it from the same search_docs payload). Object components get
// their description and per-property typed lines — this is where component
// property semantics (e.g. FormSchemaField.schemaId marking additional fields)
// surface, without duplicating them into every operation's prose.
export function renderComponentDef(name) {
  const schema = spec.components?.schemas?.[name];
  if (!schema) return '';
  const description = oneLine(schema.description);
  if (schema.enum) {
    const gloss = `Values: ${enumGloss(schema.enum, schema['x-enum-descriptions'])}.`;
    return `\`${name}\` (${schema.type}) — ${[description, gloss].filter(Boolean).join(' ')}`;
  }
  const required = new Set(schema.required || []);
  const props = Object.entries(schema.properties || {});
  if (!props.length) {
    const type = resolveType(schema);
    return `\`${name}\` (${type})${description ? ` — ${description}` : ''}`;
  }
  const lines = props.map(([prop, s]) => {
    const meta = [];
    // An enum declared inline on the property has no named component to point
    // to — decode it here. A $ref'd enum keeps its name; its table is its own
    // definition in this section.
    let inline;
    if (s.enum) {
      inline = s;
    } else if (s.items?.enum) {
      inline = s.items;
    }
    if (inline) {
      meta.push(
        `[one of: ${enumGloss(inline.enum, inline['x-enum-descriptions'])}]`,
      );
    }
    const tail = [oneLine(s.description), ...meta].filter(Boolean).join(' ');
    // `, required` exactly as `renderParamLine` marks a path param: a body
    // field the caller MUST send read no differently from an optional one, so
    // every newly-surfaced write payload looked entirely optional.
    const type = `${resolveType(s)}${required.has(prop) ? ', required' : ''}`;
    return `- ${prop} (${type})${tail ? ` — ${tail}` : ''}`;
  });
  const head = `\`${name}\`${description ? ` — ${description}` : ''}`;
  return [head, ...lines].join('\n');
}

function renderResponse(response) {
  if (!response) return '';
  // An inline (non-$ref) success body has no schema name — name it by kind rather
  // than interpolating a literal `null`.
  const root = response.root ?? (response.kind === 'list' ? 'List' : 'Object');
  if (response.kind === 'list') {
    const [summary, detailed] = response.item.variants;
    const upgrade = detailed
      ? ` (+ \`${detailed}\` fields when \`detailed=true\`)`
      : '';
    const head = `Response: \`${root}\` → { data: \`${summary}\`[]${upgrade}, pagination }`;
    // The summary item IS this operation's payload — same locality rule as
    // object roots: its full definition renders here, and the Components
    // section excludes it (it would be a duplicate).
    const def = summary ? renderComponentDef(summary) : '';
    return def ? `${head}\n${def}` : head;
  }
  // Object kind: the root component is rendered inline, field by field, typed
  // and described — it IS this operation's payload, so it gets the locality;
  // the components those fields reference are defined in the shared section.
  if (!response.fields.length) return `Response: \`${root}\``;
  const lines = response.fields.map(renderFieldLine);
  return `Response: \`${root}\` →\n${lines.join('\n')}`;
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

// The body is NAMED, not inlined: `EventInput` is ~40 fields shared by four
// write operations, so rendering it on each card would blow the payload budget
// depth-by-rank exists to protect. The Components section defines it once for
// the whole response — the same locality rule the response side already uses in
// reverse (the root IS the card's payload, so it renders inline; a body the
// card merely references does not).
function renderRequest(request) {
  if (!request) return '';
  const meta = [
    request.contentType,
    request.required ? 'required' : 'optional',
  ].join(', ');
  if (request.root) return `Request body: \`${request.root}\` (${meta})`;
  // No component to name (multipart, or an inline schema): the derived fields
  // ARE the documentation, so they render here or nowhere. `agendas.uploads
  // .create` was surfacing "see the example" while carrying a described `file`
  // field the payload then threw away.
  const lines = request.fields.map(renderFieldLine);
  return lines.length
    ? `Request body: ${meta} →\n${lines.join('\n')}`
    : `Request body: ${meta}`;
}

function renderRich(op) {
  const notable = op.params.filter(isNotable);
  const plain = op.params.filter((p) => !isNotable(p));
  // A non-SDK operation's `call` IS its wire signature, so appending the
  // method and path again would just stutter.
  const lines = [
    `### ${op.id}`,
    op.sdkCallable
      ? `\`${op.call}\` — ${op.method} ${op.path}`
      : `\`${op.call}\` — not callable through the \`oa\` client`,
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
  const request = renderRequest(op.request);
  if (request) lines.push('', request);
  const response = renderResponse(op.response);
  if (response) lines.push('', response);
  lines.push('', 'Example:', `\`\`\`${op.exampleLang}`, op.example, '```');
  return lines.join('\n');
}

const renderCompact = (op) => `### ${op.id} — ${op.summary}\n\`${op.call}\``;

// The Components section: defines, once per search response, every named type
// the rich cards reference — so no rendered type name dangles. Types already
// rendered field-by-field on their card are excluded (they'd be duplicates):
// object roots AND the list cards' summary item variants.
// Render-only, never indexed: shared components must not leak relevance credit
// between the operations that use them (same rule as the prose descriptions).
function renderComponentsSection(hits) {
  const rich = hits.slice(0, RICH_RANK_CUTOFF);
  const inline = new Set(
    rich.flatMap((op) => [op.response?.root, op.response?.item?.variants?.[0]]),
  );
  const defs = [...new Set(rich.flatMap((op) => op.componentRefs))]
    .filter((name) => !inline.has(name))
    .map(renderComponentDef)
    .filter(Boolean);
  return defs.length
    ? `Components — the named types used above:\n\n${defs.join('\n\n')}`
    : '';
}

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

// The SDK frame, rendered FIRST so it sets the lens for everything below: the
// `oa.*` calls in this payload ARE the public surface of @openagenda/api-client
// (the very SDK the `execute` sandbox bundles and runs). Framed up front, an
// agent building a durable site or tool reproduces these as SDK calls instead of
// hand-rolled `fetch`. It also states the WIRE AUTH CONTRACT, because models have
// a strong prior to write vanilla fetch for "frontend code" regardless of how the
// SDK is framed — and then guess v2's `?key=` query auth, which the v3 contract
// does not define (its only schemes are Bearer + OAuth). Stating `Authorization:
// Bearer` catches that path; the SDK sets it from `auth`. Leading, not trailing: a
// closing note after ~25 KB of operation
// detail is the weakest position — by then the model has chosen its shape. The
// only delta from an `execute` body is the one-time client setup (the sandbox
// bakes baseUrl + key; a shipped app supplies its own).
const SDK_LEAD = [
  'The operations below are the `@openagenda/api-client` npm SDK — the same `oa` '
    + 'client the `execute` tool runs, so code prototyped here ships unchanged in your '
    + 'own site or tool. One-time setup, then call exactly as shown below:',
  '```ts',
  "import { OpenAgenda, client } from '@openagenda/api-client';",
  "client.setConfig({ baseUrl: 'https://api.openagenda.com/v3', auth: 'oa_pk_…' });",
  'const oa = new OpenAgenda();',
  '```',
  'Auth: every request goes in the `Authorization: Bearer <key>` header — v3 takes '
    + 'the key (or an OAuth token) there, not as a `key` query parameter or header. The '
    + 'SDK sets it from `auth`; with raw fetch you add the header yourself. Use a '
    + 'read-only publishable key (`oa_pk_…`, safe in browsers) for reads, a secret key '
    + '(`oa_sk_…`, server-only) for writes. The `schemas` zod validators are exported '
    + 'from the package too.',
].join('\n');

/**
 * Render a full search_docs response: each hit by rank, the component
 * definitions the rich hits reference, plus the validators footer. Single
 * round-trip — everything the LLM needs to call `execute` AND to read what
 * comes back (decode tables, field semantics).
 * @param {Operation[]} hits
 */
export function renderSearch(hits) {
  if (!hits.length) return [SDK_LEAD, SCHEMAS_FOOTER].join('\n\n---\n\n');
  const body = hits.map((op, i) => renderOperation(op, i)).join('\n\n---\n\n');
  return [SDK_LEAD, body, renderComponentsSection(hits), SCHEMAS_FOOTER]
    .filter(Boolean)
    .join('\n\n---\n\n');
}
