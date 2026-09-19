// Does a contract stay inside what `search_docs` can render?
//
// `operations.js` hand-interprets a SUBSET of OpenAPI 3.1 / JSON Schema
// 2020-12. The contract is hand-written and evolving, so the failure that
// matters is silent: it adopts a construct the renderer does not read, the card
// drops or misstates it, and the LLM writes a wrong call against a green suite.
//
// The check is not a description of the renderer - a second one, kept in step
// by hand, is what this file used to be, and it disagreed with the first in
// five places. It is a measurement of it: the contract is wrapped in a proxy
// that records every `(node, key)` read, the catalogue is derived and every
// card rendered over that proxy - along with every component definition a
// payload can carry, which is every one but a list root, whose card gives
// `{ data, pagination }` on the head line and whose definition no payload
// prints. Then the raw contract is walked. A key present on a node that
// nothing read is, by construction, something no card shows; a node whose
// reference was read but whose contents never were is a shape the card renders
// opaque (an object parameter reads `properties` to decide "not a map" and
// never opens them).
//
// What it measures is READS, not uses: a key the renderer looks at and then
// discards counts as read. Dropping the `required` markers downstream of
// `objectView` raises nothing here - it is the rendering tests that catch that.
// The two are complementary, and this one covers the case no rendering test
// can: a construct nobody has written yet.
//
// What the walk raises is then classified by KEYWORD, with no notion of
// position - the position is a fact recorded by the proxy, not a claim made
// here. Two verdicts:
//   - `omit`         deliberately not shown, with the reason next to it. The
//                    omissions a contract actually exercises are pinned by a
//                    test as positions (generalised pointers), so a construct
//                    reaching a new place is a decision somebody makes rather
//                    than a silence nobody hears;
//   - unsupported    a finding, with a JSON Pointer at the node. Anything not
//                    in the table is unsupported by default.
// A handful of keywords are read and then narrowed (`type` takes its first
// non-null entry, `format` is compared to `binary` and nothing else, `anyOf` is
// looked at for a name and rendered `any`): those carry a rule on the VALUE,
// consulted whether the key was read or not.
//
// Callers: the MCP test suite, `scripts/check-contract.js` (which api-spec
// runs, so the failure reaches whoever is WRITING the contract), and
// `operations.js` on its first payload - the published server takes
// `@openagenda/api-spec` on a `^` range, so an install can carry a contract
// newer than any tested here, and it must say so rather than render plausible,
// wrong cards. The renderer's `renderEverything` is passed in by each of them
// rather than imported here: operations.js imports this module to check the
// contract it serves, and importing it back would be a cycle.

/** @typedef {{pointer: string, message: string}} Finding */
/** @typedef {null | {omit: string} | {broken: string}} Verdict */

/** @returns {Verdict} */
const omit = (reason) => ({ omit: reason });
/** @returns {Verdict} */
const broken = (message) => ({ broken: message });
// A verdict that applies only when the key went unread; a read key is fine.
const unread = (verdict) => (ctx) => (ctx.read ? null : verdict);

// A JSON Pointer segment (RFC 6901): `/` and `~` are escaped, so the pointer a
// finding carries can be pasted into any contract tool and lands on the node.
const escape = (segment) =>
  String(segment).replace(/~/g, '~0').replace(/\//g, '~1');

const pointerOf = (segments) =>
  segments.map((segment) => `/${escape(segment)}`).join('');

const canonical = (value) =>
  JSON.stringify(value, (_, v) =>
    (v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
        Object.keys(v)
          .sort()
          .map((k) => [k, v[k]]),
      )
      : v));

const deref = (contract, node) => {
  if (!node || typeof node !== 'object' || !node.$ref) return node;
  return node.$ref
    .replace(/^#\//, '')
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce((current, key) => current?.[key], contract);
};

// Wrap a contract so that every `(node, key)` read goes on record. Proxies are
// memoised per target: the renderer guards its cycles by object identity
// (`seen.has(node)`), and a fresh proxy per access would defeat that and hang.
// Functions pass through unwrapped, so `array.map` runs against the proxy and
// its index reads land here.
function record(contract) {
  /** @type {Map<object, Set<string>>} */
  const reads = new Map();
  const proxies = new WeakMap();
  const wrap = (target) => {
    if (!target || typeof target !== 'object') return target;
    let proxy = proxies.get(target);
    if (proxy) return proxy;
    proxy = new Proxy(target, {
      get(node, key, receiver) {
        if (typeof key === 'string') {
          let keys = reads.get(node);
          if (!keys) {
            keys = new Set();
            reads.set(node, keys);
          }
          keys.add(key);
        }
        return wrap(Reflect.get(node, key, receiver));
      },
    });
    proxies.set(target, proxy);
    return proxy;
  };
  return { proxy: wrap(contract), reads };
}

// Keywords whose children are named by the contract author, not by the spec:
// a key under one of these is an entry, and the position generalises it to `*`.
const MAPS = new Set([
  'paths',
  'schemas',
  'parameters',
  'responses',
  'requestBodies',
  'securitySchemes',
  'headers',
  'examples',
  'links',
  'callbacks',
  'pathItems',
  'properties',
  'patternProperties',
  'content',
  'encoding',
  'x-enum-descriptions',
  '$defs',
]);

// Which segments of a pointer are the author's names rather than keywords: an
// array index, or an entry of a map keyword. A name's own children are
// keywords again, so a property called `links` does not make the `readOnly`
// beneath it an entry of `links`.
const nameFlags = (segments) => {
  const flags = [];
  segments.forEach((segment, i) => {
    flags[i] = /^\d+$/.test(segment)
      || (i > 0 && !flags[i - 1] && MAPS.has(segments[i - 1]));
  });
  return flags;
};

// The keyword the last segment stands for in the tables: itself, or for an
// element of an array the array's name (`x-codeSamples[]`), or for an entry of
// a map the map's name (`properties/*`). `parameters` is both - a map under
// `components`, an array on an operation - so the parent's shape decides.
// Response entries split by code: a second success code and an error response
// are different decisions.
const keywordOf = (segments, inArray) => {
  const key = segments.at(-1);
  const parent = segments.at(-2);
  if (inArray) return `${parent}[]`;
  if (!nameFlags(segments).at(-1)) return key;
  if (parent === 'responses' && /^(\d[\dX]{2}|default)$/i.test(key)) {
    return /^2/.test(key) ? 'responses/2xx' : 'responses/error';
  }
  return `${parent}/*`;
};

// Where a keyword sits, with the author's names taken out: the shape of the
// position, stable across renames, and what the omissions test pins.
const generalise = (segments) => {
  const names = nameFlags(segments);
  return `/${segments.map((segment, i) => (names[i] ? '*' : segment)).join('/')}`;
};

// Every `format` the renderer has a decision for. An unlisted one fails: the
// decision is the whole point of the entry.
const FORMATS = {
  binary: 'rendered', // `Blob | File`, the type the generated client takes
  'date-time': 'an ISO 8601 string - the type is `string`',
  date: 'an ISO 8601 date - the type is `string`',
  uri: 'a URL string - the type is `string`',
  email: 'an email string - the type is `string`',
  uuid: 'a UUID string - the type is `string`',
  int32: 'an integer, as the card says',
  int64: 'an integer, as the card says - the client takes a JS number',
  float: 'a number, as the card says',
  double: 'a number, as the card says',
};

const CONSTRAINT = 'enforced by the API, which answers 422 - a limit worth knowing before the call belongs in the description';
const SAMPLE = 'a curated sample in a language the card does not render - the TypeScript one is what the sandbox runs';
const EXAMPLE = 'cards carry one runnable example instead';
const RANKS = '`search_docs` ranks, it does not browse';
const OUTGOING = 'calls the API makes TO you - `execute` only makes outgoing calls';
const NOT_BEARER = 'such a route is marked as not callable through the client';
const BOOLEAN_SCHEMA = 'a boolean schema (`true`/`false` in place of an object) - it renders as `any`';

// What an unsupported keyword costs the card, where the generic line would
// leave the reader guessing.
const SKIPPED = 'an operation with no `operationId` - it is skipped, and the route is absent from the catalogue';
const COSTS = {
  ...Object.fromEntries(
    ['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace'].map(
      (method) => [method, SKIPPED],
    ),
  ),
  'properties/*':
    'a declared field nothing renders - the object it belongs to reaches the card as a bare `object`',
  properties: 'declared fields the card never opens',
  required: 'required markers the card does not show',
  enum: 'values the card never lists',
  items: 'an array whose item type the card never resolves',
  oneOf: 'alternatives the card never lists - they vanish',
  allOf: 'a composition the card never merges - its members vanish',
  parameters:
    "parameters declared on the path item - only an operation's own `parameters` are read, so these are missing from every card on this path",
  pathItems:
    'reusable path items - they are reachable only through a `$ref` path item, which the catalogue does not follow',
  jsonSchemaDialect:
    '`jsonSchemaDialect` - the renderer assumes 2020-12 semantics and cannot honour another dialect',
  'x-enum-descriptions/*': 'a label for a value the enum does not carry',
  nullable:
    "`nullable` is OpenAPI 3.0 - 2020-12 says `type: [T, 'null']`, which IS rendered",
};

const costOf = (keyword) =>
  COSTS[keyword]
  ?? (keyword.startsWith('x-')
    ? `\`${keyword}\` - an extension the renderer does not read; decide whether a card must show it`
    : `\`${keyword}\` - the renderer never reads it, so the card drops what it says; teach operations.js the shape, or classify it in compat.js`);

// The keyword table. A rule reads `ctx` - `value`, `node`, `read` (was the key
// read), `reads` (the keys read on this node), `pointer` - and answers a
// verdict; most are `unread(omit(...))`. A keyword absent from the table is
// read or unsupported, nothing else, which is what catches `const`, `not`,
// `if`, `patternProperties`, `prefixItems`, `discriminator`, `nullable`, an
// unknown `x-` extension, a `security` scheme key nobody classified...
const RULES = {
  // The document.
  openapi: unread(omit('the version - the renderer assumes 3.1')),
  info: unread(omit('contract metadata - not part of a card')),
  servers: (ctx) => {
    if (ctx.read) return null;
    if (ctx.pointer === '/servers') {
      return omit('the base URLs - the client holds one, cards give the call');
    }
    return broken(
      "a per-route base URL - every card gives an `oa` call against the client's one host",
    );
  },
  security: unread(
    omit(
      'the document default - read only by an operation with no `security` of its own',
    ),
  ),
  tags: unread(omit(`grouping metadata - ${RANKS}`)),
  'x-tagGroups': unread(omit(`reference-site navigation - ${RANKS}`)),
  externalDocs: unread(omit('a link out - the card is the documentation')),
  webhooks: unread(omit(`${OUTGOING}, so there is nothing to render`)),
  callbacks: unread(omit(`${OUTGOING}, so there is nothing to render`)),
  // A path item.
  summary: unread(omit("the operation's own summary is what a card shows")),
  description: unread(
    omit(
      "prose at a depth the card does not carry - a path item's, a response's, an array's items, a security scheme's",
    ),
  ),
  // An operation.
  deprecated: unread(
    omit('`deprecated` - no card marks it, and the LLM will use it'),
  ),
  'x-codeSamples[]': unread(omit(SAMPLE)),
  source: unread(omit(SAMPLE)),
  label: unread(omit(SAMPLE)),
  'responses/error': unread(
    omit(
      'an error response - the card names the schemas it answers with; this node itself is what stays unread',
    ),
  ),
  'responses/*': unread(
    omit(
      'a shared error response - the card names its schema; its own prose and headers stay unread',
    ),
  ),
  // The container itself goes unread when no success response is shared: only
  // a 2xx is followed into it.
  responses: unread(
    omit(
      'shared error responses - the card names the schemas they answer with; the container itself stays unread',
    ),
  ),
  // A second success code is fine when it answers with the shape the card
  // already shows (the by-ext upserts: 200 update / 201 create, same `Event`).
  // The shape is the schema per media type: key order is spelling, and an
  // example beside the schema is not the shape either.
  'responses/2xx': (ctx) => {
    if (ctx.read) return null;
    const { contract, node, reads } = ctx;
    const shape = (code) =>
      canonical(
        Object.fromEntries(
          Object.entries(deref(contract, node[code])?.content ?? {}).map(
            ([type, media]) => [type, media?.schema ?? null],
          ),
        ),
      );
    const shown = [...reads].filter((code) => /^2/.test(code) && node[code]);
    return shown.some((code) => shape(code) === shape(ctx.key))
      ? omit('a second success code answering with the shape the card shows')
      : broken(
        'a second success response with a different shape - only the lowest is rendered, and the LLM reads the one it happened not to get',
      );
  },
  'content/*': (ctx) => {
    if (ctx.read) return null;
    // One media type was followed and this is another: the card documents one
    // body. None was: this is the only one, and it is not JSON.
    const followed = Object.keys(ctx.node).some((type) => ctx.reads.has(type));
    return followed
      ? omit(
        'a second media type - the card documents one body, JSON when the route offers it',
      )
      : broken(
        `a body in ${ctx.key} - only a JSON media type is rendered, so this card shows no body at all`,
      );
  },
  // A parameter.
  in: (ctx) => {
    if (!ctx.read) {
      return omit(`where a non-Bearer credential goes - ${NOT_BEARER}`);
    }
    if (ctx.value === 'path' || ctx.value === 'query') return null;
    return broken(
      `a \`${ctx.value}\` parameter - a card's signature carries \`path\` and \`query\` only, so \`${ctx.node.name}\` is invisible`,
    );
  },
  content: unread(
    broken(
      'a parameter carried as a media type instead of a `schema` - it renders as `any`',
    ),
  ),
  example: unread(omit(EXAMPLE)),
  examples: unread(omit(EXAMPLE)),
  style: unread(omit('wire serialization - the client does it')),
  explode: unread(omit('wire serialization - the client does it')),
  allowReserved: unread(omit('wire serialization - the client does it')),
  allowEmptyValue: unread(omit('wire serialization - the client does it')),
  // A media type, a response.
  encoding: unread(
    omit(
      'the per-part content types and headers of a multipart body - not rendered',
    ),
  ),
  headers: unread(
    omit(
      'headers - a `Location` on a creation, a rate-limit budget: nothing renders a header',
    ),
  ),
  links: unread(
    omit("declared follow-up calls - a card's example chains them explicitly"),
  ),
  // A security scheme.
  bearerFormat: unread(omit('the token format - the client carries it')),
  name: unread(
    omit(`the header or query name a non-Bearer scheme uses - ${NOT_BEARER}`),
  ),
  flows: unread(
    omit(
      'the OAuth endpoints - scopes are read off the security requirements, and the flow URLs belong to the authorization server',
    ),
  ),
  openIdConnectUrl: unread(
    omit('the OIDC discovery document - the client resolves it'),
  ),
  // A schema.
  $ref: (ctx) =>
    (/^#\/components\/(schemas|parameters|responses|requestBodies)\//.test(
      ctx.value,
    )
      ? null
      : broken(
        `a \`$ref\` to ${ctx.value} - only a reference into \`#/components/schemas|parameters|responses|requestBodies\` is followed`,
      )),
  type: (ctx) => {
    const { value, reads } = ctx;
    if (Array.isArray(value) && value.filter((t) => t !== 'null').length > 1) {
      return broken(
        `\`type: [${value.join(', ')}]\` - only the first non-null type is rendered`,
      );
    }
    if (ctx.read) return null;
    // A component root rendered by its fields is named on the field that
    // references it, and `renderComponentDef` never reads its `type`: the
    // `null` in `[object, 'null']` reaches no card.
    if (Array.isArray(value)) {
      return broken(
        `\`type: [${value.join(', ')}]\` on a root rendered by its fields - the card names the component and never says it can be \`null\``,
      );
    }
    // An object rendered by its fields, or an array by its items, has its type
    // on the card without the keyword being read.
    const shown = (value === 'object'
        && ['properties', 'allOf', 'additionalProperties'].some((key) =>
          reads.has(key)))
      || (value === 'array' && reads.has('items'));
    return shown
      ? null
      : broken('a `type` the card never resolves - the field renders `any`');
  },
  format: (ctx) => {
    const decision = FORMATS[ctx.value];
    if (decision === undefined) {
      return broken(
        `\`format: ${ctx.value}\` - decide whether it changes the type the caller must pass, like \`binary\`, or refines one the card already gives`,
      );
    }
    if (ctx.value !== 'binary') return omit(decision);
    // `resolveType` turns a binary STRING into `Blob | File`; anywhere else the
    // keyword is not read and the card keeps the declared type.
    return ctx.read
      ? null
      : broken(
        'a `format: binary` on a non-string - the card keeps the declared type, and the client takes `Blob | File`',
      );
  },
  // A boolean in place of a schema is a primitive: the proxy records nothing on
  // it, and `resolveType(true)` answers `any`.
  'properties/*': (ctx) => {
    if (typeof ctx.value === 'boolean') return broken(BOOLEAN_SCHEMA);
    return ctx.read ? null : broken(costOf('properties/*'));
  },
  items: (ctx) => {
    if (typeof ctx.value === 'boolean') return broken(BOOLEAN_SCHEMA);
    return ctx.read ? null : broken(costOf('items'));
  },
  anyOf: () =>
    broken(
      '`anyOf` - a name is looked for among its members, but the type renders `any`',
    ),
  additionalProperties: (ctx) => {
    // `true`/`false` say the object is open or closed: nothing to read.
    if (typeof ctx.value !== 'object' || ctx.value === null) return null;
    // Unread, or read and never opened: beside `properties` the card lists the
    // declared keys and says nothing of the free-form ones; a map whose values
    // carry no type (a vendor annotation alone) renders `object`.
    return ctx.read
      ? null
      : omit(
        '`additionalProperties` the card does not open - next to `properties`, or a map with no value type',
      );
  },
  'x-additionalPropertiesName': unread(
    omit("the generated client's name for a map key"),
  ),
  default: unread(omit('a field `default` - not shown')),
  minimum: unread(omit('a field `minimum` - not shown')),
  maximum: unread(omit('a field `maximum` - not shown')),
  minLength: unread(omit(`a length constraint - ${CONSTRAINT}`)),
  maxLength: unread(omit(`a length constraint - ${CONSTRAINT}`)),
  pattern: unread(omit(`a string pattern - ${CONSTRAINT}`)),
  minItems: unread(omit(`an array constraint - ${CONSTRAINT}`)),
  maxItems: unread(omit(`an array constraint - ${CONSTRAINT}`)),
  uniqueItems: unread(omit(`an array constraint - ${CONSTRAINT}`)),
  exclusiveMinimum: unread(omit(`a bound - ${CONSTRAINT}`)),
  exclusiveMaximum: unread(omit(`a bound - ${CONSTRAINT}`)),
  multipleOf: unread(omit(`a bound - ${CONSTRAINT}`)),
  title: unread(
    omit('a human title - the component NAME is what a card renders'),
  ),
  $comment: unread(omit("an author's note - not part of a card")),
  readOnly: unread(
    omit(
      'a server-set field, rendered like any other - see the direction check',
    ),
  ),
  writeOnly: unread(
    omit(
      'an input-only field, rendered like any other - see the direction check',
    ),
  ),
};

function run(contract, renderEverything) {
  /** @type {Finding[]} */
  const findings = [];
  /** @type {string[]} */
  const omitted = [];
  const report = (pointer, message) => findings.push({ pointer, message });

  const { proxy, reads } = record(contract);
  const { operations, cards, definitions } = renderEverything(proxy);

  // One verdict, applied. `where` is the generalised position an omission is
  // pinned under; for `format` it carries the value, since the decision is
  // about `binary` versus `int64`, not about the keyword.
  const apply = (verdict, pointer, where) => {
    if (!verdict) return;
    if (verdict.broken) report(pointer, verdict.broken);
    else omitted.push(where);
  };

  // Walk the raw contract beside the record. `segments` is the path so far;
  // `parent` the key this node hangs from. A node met again beneath itself (a
  // YAML alias) was verdicted where it was first met.
  const above = new Set();
  const walk = (node, segments, inArray = false) => {
    if (!node || typeof node !== 'object' || above.has(node)) return;
    const pointer = pointerOf(segments);
    const read = reads.get(node) ?? new Set();
    const keys = Object.keys(node);
    // A map (`properties`, `content`, `components`...) is never opaque as a
    // whole: each entry carries its own verdict, reported one by one below. An
    // array is: its elements are one thing, read or not.
    const map = !Array.isArray(node)
      && (segments.length < 2
        || (MAPS.has(segments.at(-1)) && !nameFlags(segments).at(-1)));
    if (!map && keys.length && !keys.some((key) => read.has(key))) {
      // Its reference was read, its contents never: the card renders it as an
      // opaque value, or not at all. One finding at the node, nothing beneath.
      const keyword = keywordOf(segments, inArray);
      const rule = RULES[keyword];
      const verdict = rule
        ? rule({
          value: node,
          node,
          read: false,
          reads: read,
          pointer,
          key: segments.at(-1),
          contract,
        })
        : broken(costOf(keyword));
      apply(
        verdict && verdict.broken
          ? broken(`nothing in it is read: ${verdict.broken}`)
          : verdict,
        pointer,
        generalise(segments),
      );
      return;
    }
    above.add(node);
    for (const key of keys) {
      const value = node[key];
      const at = [...segments, key];
      const keyword = keywordOf(at, Array.isArray(node));
      const rule = RULES[keyword];
      let verdict = null;
      if (rule) {
        verdict = rule({
          value,
          node,
          read: read.has(key),
          reads: read,
          pointer: pointerOf(at),
          key,
          contract,
        });
      } else if (!read.has(key)) {
        verdict = broken(costOf(keyword));
      }
      const where = keyword === 'format' ? `${generalise(at)}:${value}` : generalise(at);
      apply(verdict, pointerOf(at), where);
      // Beneath an unread key nothing was read either: reported once, here.
      if (read.has(key) && !verdict?.broken) {
        walk(value, at, Array.isArray(node));
      }
    }
    above.delete(node);
  };
  walk(contract, []);

  // The direction check. `readOnly`/`writeOnly` are rendered like any other
  // field, so the card offers a request field the API refuses, or promises a
  // response field that never comes. Reachability is walked through `$ref`
  // here, since the record cannot tell a request read from a response read.
  // `seen` holds nodes, so a cycle through a `$ref` and one through a YAML
  // alias stop alike.
  const reach = (schema, segments, flag, from, seen) => {
    if (!schema || typeof schema !== 'object' || seen.has(schema)) return;
    seen.add(schema);
    if (schema.$ref) {
      const target = deref(contract, schema);
      return reach(
        target,
        schema.$ref.replace(/^#\//, '').split('/'),
        flag,
        from,
        seen,
      );
    }
    if (schema[flag] === true) {
      report(
        `/${segments.map(escape).join('/')}/${flag}`,
        flag === 'readOnly'
          ? `\`readOnly\` on a field the request body of ${from} reaches - the card offers a field the API will refuse`
          : `\`writeOnly\` on a field the response of ${from} reaches - the card promises a field that never comes back`,
      );
    }
    for (const [name, property] of Object.entries(schema.properties ?? {})) {
      reach(property, [...segments, 'properties', name], flag, from, seen);
    }
    reach(schema.items, [...segments, 'items'], flag, from, seen);
    if (typeof schema.additionalProperties === 'object') {
      reach(
        schema.additionalProperties,
        [...segments, 'additionalProperties'],
        flag,
        from,
        seen,
      );
    }
    for (const composed of ['allOf', 'oneOf', 'anyOf']) {
      (schema[composed] ?? []).forEach((member, i) =>
        reach(member, [...segments, composed, String(i)], flag, from, seen));
    }
  };

  for (const [path, item] of Object.entries(contract.paths ?? {})) {
    for (const [method, op] of Object.entries(item)) {
      if (!op || typeof op !== 'object' || !op.operationId) continue;
      const at = ['paths', path, method];
      const body = deref(contract, op.requestBody);
      for (const [type, media] of Object.entries(body?.content ?? {})) {
        const from = op.requestBody?.$ref
          ? op.requestBody.$ref.replace(/^#\//, '').split('/')
          : [...at, 'requestBody'];
        reach(
          media.schema,
          [...from, 'content', type, 'schema'],
          'readOnly',
          op.operationId,
          new Set(),
        );
      }
      for (const [code, response] of Object.entries(op.responses ?? {})) {
        if (!/^2/.test(code)) continue;
        const from = response?.$ref
          ? response.$ref.replace(/^#\//, '').split('/')
          : [...at, 'responses', code];
        for (const [type, media] of Object.entries(
          deref(contract, response)?.content ?? {},
        )) {
          reach(
            media.schema,
            [...from, 'content', type, 'schema'],
            'writeOnly',
            op.operationId,
            new Set(),
          );
        }
      }
    }
  }

  // Every component a card defines must be led to from that card: by a name in
  // a TYPE position on the card itself, or on a definition already reached. A
  // definition nothing leads to is a shape the card rendered opaque - a body
  // that is a union of components, say, whose members the derivation collected
  // and the request line never named.
  //
  // Only a type position leads anywhere, and the renderer reports its own as it
  // writes them: `cards` and `definitions` hold NAMES, not text. Reading them
  // back out of the rendered block instead would also find them in the prose
  // beside the types, and prose cites shapes that live on other cards by
  // design - an operation description naming the component would vouch for its
  // opaque body.
  for (const op of operations) {
    const names = new Set(op.componentRefs);
    const reached = new Set();
    const queue = [...cards.get(op.id)?.types ?? []];
    while (queue.length) {
      const name = queue.pop();
      if (!names.has(name) || reached.has(name)) continue;
      reached.add(name);
      queue.push(...definitions.get(name)?.types ?? []);
    }
    for (const name of op.componentRefs.filter((each) => !reached.has(each))) {
      report(
        `/paths/${escape(op.path)}/${op.method.toLowerCase()}`,
        `\`${name}\` is defined for this card, and nothing on the card leads to it - the shape that references it renders opaque`,
      );
    }
  }

  return { findings, omitted };
}

/**
 * Check one contract against what `search_docs` can render.
 *
 * @param {any} contract  A parsed OpenAPI document.
 * @param {(contract: any) => {operations: any[], cards: Map<string, {types: Set<string>}>, definitions: Map<string, {types: Set<string>}>}} renderEverything
 *   The renderer's dry run, from operations.js: it renders everything the
 *   contract can become over the proxy, and reports the component names each
 *   block put in a type position.
 * @returns {Finding[]} Unsupported constructs, in document order. Empty is the
 *   only acceptable state: each finding is a card that would be wrong.
 */
export function checkContract(contract, renderEverything) {
  return run(contract, renderEverything).findings;
}

/**
 * The deliberate omissions this contract actually exercises, as positions:
 * generalised JSON Pointers, one per place a keyword the card does not show
 * is used (`/components/schemas/*\/properties/*\/pattern`). Each is something
 * the contract states and no card shows.
 *
 * @param {any} contract
 * @param {(contract: any) => object} renderEverything  As for `checkContract`.
 * @returns {string[]} Sorted, deduplicated.
 */
export function omissions(contract, renderEverything) {
  return [...new Set(run(contract, renderEverything).omitted)].sort();
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
 * version was tested against - and a card that silently drops a required field
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
  const head = `⚠ This server renders ${findings.length} construct${many ? 's' : ''} of the loaded API contract incompletely, so a card may omit or misstate a field. Where a card and a live response disagree on the shapes named below, the response is right.`;
  const lines = shown.map((f) => `  ${f.pointer}: ${f.message}`);
  if (rest) lines.push(`  … and ${rest} more.`);
  return [head, ...lines].join('\n');
}
