// Does a contract stay inside what `search_docs` can render?
//
// `operations.js` hand-interprets a SUBSET of OpenAPI 3.1 / JSON Schema
// 2020-12. The contract is hand-written and evolving, so the failure that
// matters is silent: it adopts a construct the renderer does not read, the card
// drops or misstates it, and the LLM writes a wrong call against a green suite.
//
// So every keyword is classified HERE, BY POSITION, and anything unclassified
// fails. The position is the point: "the renderer knows this keyword" is not the
// same claim as "the renderer reads it HERE". `additionalProperties` names a map
// alone and hides free-form keys next to `properties`; `oneOf` lists its
// branches at a component root and flattens to a union of names on a property;
// `default` and `minimum` reach the card from a parameter and are dropped from a
// field; `format: binary` changes the type a caller must send while
// `format: date-time` refines a string the card already names. A flat list of
// known keywords passes all four.
//
// Three verdicts, and only the last is a failure:
//   - read       (`null`)      the renderer reads it in this position, and a
//                              test pins what comes out;
//   - `omit`                   deliberately not shown, with the reason recorded.
//                              `omissions()` lists the ones a contract actually
//                              uses and a test pins THAT list, so adopting a new
//                              omission is a decision somebody makes rather than
//                              a silence nobody hears;
//   - `broken`                 the card would be wrong or incomplete. A finding.
//
// Pure: no I/O, no module state, contract passed in. Callers: the MCP test
// suite, `scripts/check-contract.js` (which api-spec runs, so the failure
// reaches whoever is WRITING the contract), and `operations.js` at load — the
// published server takes `@openagenda/api-spec` on a `^` range, so an install
// can carry a contract newer than any tested here, and it must say so rather
// than render plausible, wrong cards.

/** @typedef {{pointer: string, message: string}} Finding */
/** @typedef {null | {omit: string} | {broken: string}} Verdict */

/** @returns {Verdict} */
const omit = (reason) => ({ omit: reason });
/** @returns {Verdict} */
const broken = (message) => ({ broken: message });

// A JSON Pointer segment (RFC 6901): `/` and `~` are escaped, so the pointer a
// finding carries can be pasted into any contract tool and lands on the node.
const escape = (segment) =>
  String(segment).replace(/~/g, '~0').replace(/\//g, '~1');

// The positions a schema is read in — the renderer treats them differently, and
// so do the rules below.
//
//   component  a `#/components/schemas/*` root — renders as its own entry, with
//              union branches listed and `allOf` merged
//   body       a request or response root — same treatment as a component
//   data       the `data` property of a list response
//   list item  the items of that `data` array — inline variants are unfolded
//   property   a property of any of the above — named shapes stay named, and
//              only an UNNAMED object is unfolded, one level
//   item       array items outside a list response
//   value      the values of a map (`additionalProperties`)
//   member     a member of an `allOf`/`oneOf`/`anyOf` below a root
//   param      a parameter schema — the only position where `default`,
//              `minimum` and `maximum` reach the card
const ROOTS = new Set(['component', 'body']);

// Every `format` the renderer has a decision for. An unlisted one fails:
// deciding is the whole point of the entry.
const FORMATS = {
  // Rendered: the generated client takes a `Blob | File` here, and a card
  // reading `string` invites the agent to send a file name.
  binary: null,
  'date-time': omit(
    'an ISO 8601 string — the type is `string`, and the description says which shape',
  ),
  date: omit(
    'an ISO 8601 date — the type is `string`, and the description says which shape',
  ),
  uri: omit('a URL string — the type is `string`'),
  email: omit('an email string — the type is `string`'),
  uuid: omit('a UUID string — the type is `string`'),
  int32: omit('an integer, as the card says'),
  int64: omit('an integer, as the card says — the client takes a JS number'),
  float: omit('a number, as the card says'),
  double: omit('a number, as the card says'),
};

// Schema keywords. A rule reads `(value, schema, ctx)` and returns a verdict.
// Anything ABSENT from this table is unsupported by default: a keyword nobody
// thought about cannot pass for handled. That is what catches `anyOf`, `const`,
// `patternProperties`, `prefixItems`, `not`, `if`, `discriminator`,
// `propertyNames`, `unevaluated*`, `dependent*`, `$defs`, 3.0's `nullable`…
const SCHEMA_KEYWORDS = {
  $ref: (value) =>
    (value.startsWith('#/components/schemas/')
      ? null
      : broken(
        `a \`$ref\` to ${value} — only \`#/components/schemas/<Name>\` resolves into a named, defined type`,
      )),
  type: (value) =>
    (Array.isArray(value) && value.filter((t) => t !== 'null').length > 1
      ? broken(
        `\`type: [${value.join(', ')}]\` — only the first non-null type is rendered`,
      )
      : null),
  format: (value) =>
    (FORMATS[value] === undefined
      ? broken(
        `\`format: ${value}\` — decide whether it changes the type the caller must pass, like \`binary\`, or refines one the card already gives`,
      )
      : FORMATS[value]),
  properties: () => null,
  required: () => null,
  items: () => null,
  allOf: () => null,
  oneOf: () => null,
  description: () => null,
  'x-enum-descriptions': () => null,
  enum: (value, schema, ctx) =>
    (ctx.position === 'param' || ctx.position === 'item' || ctx.underProperty
      ? null
      : omit(
        'an `enum` at a component root — the values are not listed there; the ones worth knowing are spelled out by hand in the description, as `EventStatus` does',
      )),
  additionalProperties: (value, schema) => {
    // `true`/`false` say the object is open or closed: no shape to render.
    if (typeof value !== 'object' || value === null) return null;
    if (schema.properties) {
      return omit(
        '`additionalProperties` next to `properties` — the card lists the declared keys and says nothing of the free-form ones',
      );
    }
    return null; // a map, rendered `Record<string, T>`
  },
  // Names the map's index key in the generated client (`AdditionalFields`); the
  // card renders `Record<string, T>`, where that key needs no name.
  'x-additionalPropertiesName': () =>
    omit("the generated client's name for a map key"),
  readOnly: (value, schema, ctx) =>
    (ctx.direction === 'request'
      ? broken(
        '`readOnly` on a field a request body reaches — the card offers a field the API will refuse',
      )
      : omit('a server-set field, rendered like any other on a response')),
  writeOnly: (value, schema, ctx) =>
    (ctx.direction === 'response'
      ? broken(
        '`writeOnly` on a field a response reaches — the card promises a field that never comes back',
      )
      : omit('an input-only field, rendered like any other on a request body')),
  default: (value, schema, ctx) =>
    (ctx.position === 'param' ? null : omit('a field `default` — not shown')),
  minimum: (value, schema, ctx) =>
    (ctx.position === 'param' ? null : omit('a field `minimum` — not shown')),
  maximum: (value, schema, ctx) =>
    (ctx.position === 'param' ? null : omit('a field `maximum` — not shown')),
  // Constraints the API enforces and answers `422` on. The card gives the
  // shape; a limit worth knowing before the call belongs in the description,
  // which IS rendered.
  minLength: () => omit('a length constraint — enforced by the API, not shown'),
  maxLength: () => omit('a length constraint — enforced by the API, not shown'),
  pattern: () => omit('a string pattern — enforced by the API, not shown'),
  minItems: () => omit('an array constraint — enforced by the API, not shown'),
  maxItems: () => omit('an array constraint — enforced by the API, not shown'),
  uniqueItems: () =>
    omit('an array constraint — enforced by the API, not shown'),
  exclusiveMinimum: () => omit('a bound — enforced by the API, not shown'),
  exclusiveMaximum: () => omit('a bound — enforced by the API, not shown'),
  multipleOf: () => omit('a bound — enforced by the API, not shown'),
  title: () =>
    omit('a human title — the component NAME is what a card renders'),
  example: () =>
    omit('a per-schema example — cards carry one runnable example instead'),
  examples: () =>
    omit('per-schema examples — cards carry one runnable example instead'),
  externalDocs: () => omit('a link out — the card is the documentation'),
  deprecated: () =>
    omit('`deprecated` — no card marks the field, and the LLM will use it'),
};

const hasOwnFields = (schema) =>
  !!schema && typeof schema === 'object' && !schema.$ref && !!schema.properties;

// Compositions a per-keyword rule cannot express: each is about a COMBINATION,
// or about a keyword that is read at a root and lossy one level down. Every one
// of them was a real mis-rendering, or one probe away from being one.
const SCHEMA_SHAPES = [
  {
    when: (schema) => !!(schema.oneOf || schema.anyOf) && !!schema.properties,
    message:
      'a union that also declares `properties` — only the properties render, and the alternatives vanish',
  },
  {
    when: (schema, ctx) =>
      !ROOTS.has(ctx.position)
      && ctx.position !== 'list item'
      && (schema.oneOf ?? []).some(hasOwnFields),
    message:
      'an inline union with an object branch — the branch renders as `object`, and its fields are lost',
  },
  {
    when: (schema, ctx) =>
      !ROOTS.has(ctx.position)
      && (schema.allOf ?? []).some((member) => member?.$ref)
      && (schema.allOf ?? []).some(hasOwnFields),
    message:
      'an `allOf` adding fields to a referenced component — the card names the component, and the added fields are lost',
  },
  {
    when: (schema, ctx) =>
      ctx.position === 'body'
      && (schema.allOf ?? []).some((member) => member?.$ref),
    message:
      'a body wrapped in `allOf` around a component — it renders inline, leaving that component defined with no card leading to it',
  },
  {
    when: (schema) => hasOwnFields(schema.additionalProperties),
    message:
      'a map whose values are inline objects — the values render as `object`, and their fields are lost',
  },
];

// The non-schema positions, same three verdicts, same default.
const DOCUMENT_KEYS = {
  openapi: null,
  paths: null,
  components: null,
  security: null, // inherited by every operation
  info: omit('contract metadata — not part of a card'),
  servers: omit('the base URLs — the client holds one, cards give the call'),
  tags: omit('grouping metadata — `search_docs` ranks, it does not browse'),
  'x-tagGroups': omit(
    'reference-site navigation — `search_docs` ranks, it does not browse',
  ),
  externalDocs: omit('a link out — the card is the documentation'),
  webhooks: omit(
    'calls the API makes TO you — `execute` only makes outgoing calls, so there is nothing to render',
  ),
  jsonSchemaDialect: broken(
    '`jsonSchemaDialect` — the renderer assumes 2020-12 semantics and cannot honour another dialect',
  ),
};

const PATH_ITEM_KEYS = {
  get: null,
  put: null,
  post: null,
  delete: null,
  patch: null,
  options: null,
  head: null,
  trace: null,
  summary: omit("the operation's own summary is what a card shows"),
  description: omit("the operation's own description is what a card shows"),
  $ref: broken(
    'a `$ref` path item — its operations are not read at all, and vanish from the catalogue',
  ),
  parameters: broken(
    "parameters declared on the path item — only an operation's own `parameters` are read, so these are missing from every card on this path",
  ),
  servers: broken(
    "a per-path base URL — every card gives an `oa` call against the client's one host",
  ),
};

const OPERATION_KEYS = {
  operationId: null,
  summary: null,
  description: null,
  parameters: null,
  requestBody: null,
  responses: null,
  security: null,
  'x-codeSamples': null,
  'x-synonyms': null,
  tags: omit('grouping metadata — `search_docs` ranks, it does not browse'),
  externalDocs: omit('a link out — the card is the documentation'),
  callbacks: omit(
    'calls the API makes TO you — `execute` only makes outgoing calls, so there is nothing to render',
  ),
  deprecated: omit(
    '`deprecated` — no card warns, and the LLM will call the route',
  ),
  servers: broken(
    "a per-operation base URL — the card gives an `oa` call against the client's one host",
  ),
};

const PARAMETER_KEYS = {
  name: null,
  in: null,
  required: null,
  schema: null,
  description: null,
  example: omit('cards carry one runnable example instead'),
  examples: omit('cards carry one runnable example instead'),
  style: omit('wire serialization — the client does it'),
  explode: omit('wire serialization — the client does it'),
  allowReserved: omit('wire serialization — the client does it'),
  allowEmptyValue: omit('wire serialization — the client does it'),
  deprecated: omit('`deprecated` — no card marks the parameter'),
  content: broken(
    'a parameter carried as a media type instead of a `schema` — it renders as `any`',
  ),
};

const REQUEST_BODY_KEYS = { content: null, required: null, description: null };

// The reusable-object containers. A `$ref`'d parameter, response or body is
// checked HERE, at its definition, and skipped at every use site — the contract
// shares one `AgendaUid` across sixty operations, and sixty copies of the same
// finding help nobody.
const COMPONENTS_KEYS = {
  schemas: null,
  parameters: null,
  responses: null,
  requestBodies: null,
  securitySchemes: null,
  headers: broken(
    'reusable headers — nothing renders a header, so whatever they describe is invisible',
  ),
  pathItems: broken(
    'reusable path items — they are reachable only through a `$ref` path item, which the catalogue does not read',
  ),
  examples: omit(
    'reusable examples — cards carry one runnable example instead',
  ),
  links: omit(
    "declared follow-up calls — a card's example chains them explicitly",
  ),
  callbacks: omit(
    'calls the API makes TO you — `execute` only makes outgoing calls',
  ),
};

// Reachability and scopes are read off a scheme's TYPE (and `scheme` for HTTP);
// the rest describes how to obtain a credential, which is the client's problem
// and not a card's.
const SECURITY_SCHEME_KEYS = {
  type: null,
  scheme: null,
  description: omit(
    'how to obtain the credential — the payload states the Bearer contract once, up front',
  ),
  bearerFormat: omit('the token format — the client carries it'),
  name: omit(
    'the header or query name a non-Bearer scheme uses — such a route is marked as not callable through the client',
  ),
  in: omit(
    'where a non-Bearer credential goes — such a route is marked as not callable through the client',
  ),
  flows: omit(
    'the OAuth endpoints — scopes are read off the security requirements, and the flow URLs belong to the authorization server',
  ),
  openIdConnectUrl: omit(
    'the OIDC discovery document — the client resolves it',
  ),
};

const RESPONSE_KEYS = {
  description: null,
  content: null,
  headers: omit(
    'response headers — a `Location` on a creation, a rate-limit budget: not shown',
  ),
  links: omit(
    "declared follow-up calls — a card's example chains them explicitly",
  ),
};

const MEDIA_TYPE_KEYS = {
  schema: null,
  example: omit('cards carry one runnable example instead'),
  examples: omit('cards carry one runnable example instead'),
  encoding: omit(
    '`encoding` — the per-part content types and headers of a multipart body are not rendered',
  ),
};

// The renderer's own JSON matcher, kept in step with `operations.js`: a `json`
// subtype or a `+json` suffix, on the media type itself and not its parameters.
const JSON_MEDIA = /^[^;/]+\/(?:[^;]*\+)?json\s*(?:;|$)/i;

const deref = (contract, node) => {
  if (!node || typeof node !== 'object' || !node.$ref) return node;
  return node.$ref
    .replace(/^#\//, '')
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce((current, key) => current?.[key], contract);
};

function run(contract) {
  /** @type {Finding[]} */
  const findings = [];
  /** @type {string[]} */
  const omitted = [];
  const seen = new Set();

  const report = (pointer, message) => findings.push({ pointer, message });

  // Apply one verdict. `label` names the keyword in the omission line; `what`
  // names the position it sits in.
  const record = (verdict, pointer, what, label) => {
    if (!verdict) return;
    if (verdict.broken) report(pointer, verdict.broken);
    else omitted.push(`${what} \`${label}\` — ${verdict.omit}`);
  };

  // Read a table of keys: an unclassified one is a finding, by default.
  const table = (node, keys, pointer, what) => {
    for (const key of Object.keys(node)) {
      const rule = keys[key];
      if (rule === undefined) {
        report(
          `${pointer}/${escape(key)}`,
          key.startsWith('x-')
            ? `\`${key}\` — an extension the renderer does not read; decide whether a card must show it`
            : `\`${key}\` on ${what} — the renderer does not read it; classify it in compat.js before the contract relies on it`,
        );
      } else {
        record(rule, `${pointer}/${escape(key)}`, what, key);
      }
    }
  };

  const walkSchema = (schema, pointer, ctx) => {
    if (schema === undefined || schema === null) return;
    if (typeof schema === 'boolean') {
      report(
        pointer,
        'a boolean schema (`true`/`false` in place of an object) — it renders as `any`',
      );
      return;
    }
    if (typeof schema !== 'object') return;
    // A `$ref` is not followed: components are walked once from their own
    // definition, which also ends the cycles the contract legitimately has.
    if (schema.$ref) {
      record(
        SCHEMA_KEYWORDS.$ref(schema.$ref),
        `${pointer}/$ref`,
        'a schema',
        '$ref',
      );
      const siblings = Object.keys(schema).filter((key) => key !== '$ref');
      if (siblings.length) {
        report(
          pointer,
          `a \`$ref\` with ${siblings.map((key) => `\`${key}\``).join(', ')} beside it — the card renders the referenced component and drops the rest`,
        );
      }
      return;
    }
    // The same shape can be reached twice (a body and a response share a
    // schema object); the position is part of the identity, since that is what
    // the verdicts turn on.
    const visit = `${pointer}|${ctx.position}|${ctx.direction}`;
    if (seen.has(visit)) return;
    seen.add(visit);

    for (const [name, value] of Object.entries(schema)) {
      const rule = SCHEMA_KEYWORDS[name];
      if (rule === undefined) {
        report(
          `${pointer}/${escape(name)}`,
          name.startsWith('x-')
            ? `\`${name}\` — an extension the renderer does not read; decide whether a card must show it`
            : `\`${name}\` — the renderer does not read it; classify it in compat.js before the contract relies on it`,
        );
        continue;
      }
      // `format` is recorded per VALUE: the decision is about `binary` versus
      // `int64`, not about the keyword.
      const label = name === 'format' ? `${name}: ${value}` : name;
      record(
        rule(value, schema, ctx),
        `${pointer}/${escape(name)}`,
        'a schema',
        label,
      );
    }

    for (const shape of SCHEMA_SHAPES) {
      if (shape.when(schema, ctx)) report(pointer, shape.message);
    }

    const root = ROOTS.has(ctx.position);
    for (const [name, property] of Object.entries(schema.properties ?? {})) {
      walkSchema(property, `${pointer}/properties/${escape(name)}`, {
        ...ctx,
        position: root && name === 'data' ? 'data' : 'property',
        underProperty: true,
      });
    }
    walkSchema(schema.items, `${pointer}/items`, {
      ...ctx,
      position: ctx.position === 'data' ? 'list item' : 'item',
    });
    if (
      schema.additionalProperties
      && typeof schema.additionalProperties === 'object'
    ) {
      walkSchema(
        schema.additionalProperties,
        `${pointer}/additionalProperties`,
        {
          ...ctx,
          position: 'value',
        },
      );
    }
    for (const composed of ['allOf', 'oneOf', 'anyOf']) {
      const members = schema[composed];
      if (!Array.isArray(members)) continue;
      members.forEach((member, i) =>
        walkSchema(member, `${pointer}/${composed}/${i}`, {
          ...ctx,
          // A branch of a root composition is still read as that root: the
          // renderer merges an `allOf` and lists a union's branches there.
          position:
            root || ctx.position === 'list item' ? ctx.position : 'member',
        }));
    }
  };

  // A parameter, wherever it is declared. `in: header` and a `content` instead
  // of a `schema` are both invisible on a card, so both are read here rather
  // than at each of the sixty operations sharing an `AgendaUid`.
  const checkParameter = (parameter, pointer) => {
    if (!parameter || typeof parameter !== 'object') return;
    table(parameter, PARAMETER_KEYS, pointer, 'a parameter');
    if (parameter.in !== 'path' && parameter.in !== 'query') {
      report(
        pointer,
        `a \`${parameter.in}\` parameter — a card's signature carries \`path\` and \`query\` only, so \`${parameter.name}\` is invisible`,
      );
    }
    walkSchema(parameter.schema, `${pointer}/schema`, {
      position: 'param',
      direction: 'request',
    });
  };

  const checkRequestBody = (body, pointer) => {
    if (!body || typeof body !== 'object') return;
    table(body, REQUEST_BODY_KEYS, pointer, 'a request body');
    for (const [type, media] of Object.entries(body.content ?? {})) {
      const mediaAt = `${pointer}/content/${escape(type)}`;
      table(media, MEDIA_TYPE_KEYS, mediaAt, 'a media type');
      walkSchema(media.schema, `${mediaAt}/schema`, {
        position: 'body',
        direction: 'request',
      });
    }
  };

  // `rendered` says whether a card shows this response at all: only a success
  // one is, so the media-type and shape rules apply there. A shared error
  // response is still checked — for the keys it declares — where it is defined.
  const walkResponse = (response, pointer, rendered) => {
    if (!response || typeof response !== 'object') return null;
    table(response, RESPONSE_KEYS, pointer, 'a response');
    const content = response.content ?? {};
    const json = Object.keys(content).find((type) => JSON_MEDIA.test(type));
    if (rendered && Object.keys(content).length && !json) {
      report(
        pointer,
        `a body in ${Object.keys(content).join(', ')} — only a JSON media type is rendered, so this card shows no response at all`,
      );
    }
    for (const [type, media] of Object.entries(content)) {
      const mediaAt = `${pointer}/content/${escape(type)}`;
      table(media, MEDIA_TYPE_KEYS, mediaAt, 'a media type');
      if (rendered) {
        walkSchema(media.schema, `${mediaAt}/schema`, {
          position: 'body',
          direction: 'response',
        });
      }
    }
    return json ? JSON.stringify(content[json]?.schema ?? null) : null;
  };

  // The JSON shape a shared response carries, without re-checking it: its keys
  // and schemas were read at `/components/responses/*`.
  const shapeOfShared = (node, pointer, success) => {
    const content = node?.content ?? {};
    const json = Object.keys(content).find((type) => JSON_MEDIA.test(type));
    if (success && Object.keys(content).length && !json) {
      report(
        pointer,
        `a body in ${Object.keys(content).join(', ')} — only a JSON media type is rendered, so this card shows no response at all`,
      );
    }
    return json ? JSON.stringify(content[json]?.schema ?? null) : null;
  };

  const walkResponses = (responses, pointer, operationId) => {
    const shapes = [];
    for (const [code, response] of Object.entries(responses)) {
      const at = `${pointer}/${escape(code)}`;
      const success = /^2(\d\d|XX)$/i.test(code);
      // A `$ref`'d response is a shared component (every 4xx here is one),
      // checked where it is defined and not at each use.
      const node = response?.$ref ? deref(contract, response) : response;
      const shape = response?.$ref
        ? shapeOfShared(node, at, success)
        : walkResponse(node, at, success);
      if (success && shape) shapes.push([code, shape]);
    }
    // The card renders the LOWEST 2xx. A second, different success shape is
    // documented nowhere, and the LLM reads the one it happened not to get.
    if (new Set(shapes.map(([, shape]) => shape)).size > 1) {
      report(
        pointer,
        `${operationId} answers ${shapes.map(([code]) => code).join(' and ')} with different shapes — only the lowest is rendered`,
      );
    }
  };

  table(contract, DOCUMENT_KEYS, '', 'the document');

  const components = contract.components ?? {};
  table(components, COMPONENTS_KEYS, '/components', 'the components section');

  for (const [name, parameter] of Object.entries(components.parameters ?? {})) {
    checkParameter(parameter, `/components/parameters/${escape(name)}`);
  }
  for (const [name, response] of Object.entries(components.responses ?? {})) {
    walkResponse(response, `/components/responses/${escape(name)}`, false);
  }
  for (const [name, body] of Object.entries(components.requestBodies ?? {})) {
    checkRequestBody(body, `/components/requestBodies/${escape(name)}`);
  }
  for (const [name, scheme] of Object.entries(
    components.securitySchemes ?? {},
  )) {
    table(
      scheme,
      SECURITY_SCHEME_KEYS,
      `/components/securitySchemes/${escape(name)}`,
      'a security scheme',
    );
  }

  for (const [name, schema] of Object.entries(components.schemas ?? {})) {
    // A component is reachable from both directions unless the contract keeps
    // input and output shapes apart (this one does). `direction: 'any'` is what
    // keeps the readOnly/writeOnly rules quiet here and fires them where a body
    // actually reaches the field.
    walkSchema(schema, `/components/schemas/${escape(name)}`, {
      position: 'component',
      direction: 'any',
    });
  }

  for (const [path, item] of Object.entries(contract.paths ?? {})) {
    const pathAt = `/paths/${escape(path)}`;
    table(item, PATH_ITEM_KEYS, pathAt, 'a path item');
    for (const [method, op] of Object.entries(item)) {
      if (!op || typeof op !== 'object' || PATH_ITEM_KEYS[method] !== null) {
        continue;
      }
      const opAt = `${pathAt}/${escape(method)}`;
      if (!op.operationId) {
        report(
          opAt,
          'an operation with no `operationId` — it is skipped, and the route is absent from the catalogue',
        );
        continue;
      }
      table(op, OPERATION_KEYS, opAt, 'an operation');

      (op.parameters ?? []).forEach((parameter, i) => {
        if (parameter?.$ref) return; // checked at /components/parameters/*
        checkParameter(parameter, `${opAt}/parameters/${i}`);
      });

      if (op.requestBody && !op.requestBody.$ref) {
        checkRequestBody(op.requestBody, `${opAt}/requestBody`);
      }

      walkResponses(op.responses ?? {}, `${opAt}/responses`, op.operationId);
    }
  }

  return { findings, omitted };
}

/**
 * Check one contract against what `search_docs` can render.
 *
 * @param {any} contract  A parsed OpenAPI document.
 * @returns {Finding[]} Unsupported constructs, in document order. Empty is the
 *   only acceptable state: each finding is a card that would be wrong.
 */
export function checkContract(contract) {
  return run(contract).findings;
}

/**
 * The deliberate omissions this contract actually exercises — a `pattern` on a
 * field, a `style` on a parameter, a `Location` header. Each is something the
 * contract states and no card shows.
 *
 * @param {any} contract
 * @returns {string[]} Sorted `<position> \`keyword\` — reason` lines, deduplicated.
 */
export function omissions(contract) {
  return [...new Set(run(contract).omitted)].sort();
}

/**
 * One line per finding, for a person reading a terminal or an LLM reading a
 * warning at the top of a `search_docs` payload.
 *
 * @param {Finding[]} findings
 * @returns {string}
 */
export function formatFindings(findings) {
  return findings.map((f) => `${f.pointer}: ${f.message}`).join('\n');
}

// How many findings a payload shows before summarising. The point is that the
// reader distrusts the right cards, not that it reads the whole list.
const SHOWN = 5;

/**
 * The warning a `search_docs` payload leads with when the contract it loaded
 * goes beyond this version. A published server resolves `@openagenda/api-spec`
 * on a `^` range, so an install can carry a contract newer than any this
 * version was tested against — and a card that silently drops a required field
 * is worse than one that says it may be incomplete.
 *
 * @param {Finding[]} findings
 * @returns {string} '' when there is nothing to warn about.
 */
export function contractWarning(findings) {
  if (!findings.length) return '';
  const shown = findings.slice(0, SHOWN);
  const rest = findings.length - shown.length;
  const many = findings.length > 1;
  const head = `⚠ This server is rendering an API contract that goes beyond what it understands: ${findings.length} construct${many ? 's' : ''} below ${many ? 'are' : 'is'} not read by this version, so a card may omit or misstate a field. Upgrade \`@openagenda/mcp\`; until then, treat the affected shapes as incomplete and check a call against the API reference before relying on it.`;
  const lines = shown.map((f) => `  ${f.pointer}: ${f.message}`);
  if (rest) lines.push(`  … and ${rest} more.`);
  return [head, ...lines].join('\n');
}
