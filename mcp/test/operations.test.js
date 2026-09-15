import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { parse } from 'yaml';
import {
  OPERATIONS,
  searchOperations,
  renderOperation,
  renderSearch,
  renderComponentDef,
  skeletonExample,
  SCHEMA_VALIDATORS,
  enumSchemaOf,
  isSdkCallable,
  oauthScopes,
  successBody,
  deriveRequest,
  deriveResponse,
} from '../src/docs/operations.js';

// The contract itself, to pin the structural facts the module derives from.
const spec = parse(
  readFileSync(
    new URL(import.meta.resolve('@openagenda/api-spec/openapi.yaml')),
    'utf8',
  ),
);

// Every `oa.<id>(…)` call in an example, with the keys its `path`, `query` and
// `body` object literals set — parsed with the TypeScript compiler the package
// already builds with, since the samples ARE TypeScript. Per call, not per
// example: a sample may chain operations (stage an upload, then attach it on an
// event write), and each call answers to its own operation's contract. Nested
// keys (`extId: { key }`) are values, not parameters, and never surface.
function exampleCalls(example) {
  const source = ts.createSourceFile(
    'example.ts',
    example,
    ts.ScriptTarget.Latest,
    true,
  );
  const keysOf = (node) =>
    (node && ts.isObjectLiteralExpression(node)
      ? node.properties.flatMap((p) => (p.name ? [p.name.text] : []))
      : []);
  const calls = [];
  const visit = (node) => {
    if (
      ts.isCallExpression(node)
      && node.expression.getText().startsWith('oa.')
    ) {
      const [arg] = node.arguments;
      const member = (name) =>
        (arg && ts.isObjectLiteralExpression(arg)
          ? arg.properties.find(
            (p) => ts.isPropertyAssignment(p) && p.name.getText() === name,
          )?.initializer
          : undefined);
      calls.push({
        id: node.expression.getText().slice('oa.'.length),
        path: keysOf(member('path')),
        query: keysOf(member('query')),
        body: keysOf(member('body')),
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return calls;
}

// The type expression at the start of `text`, up to the parenthesis closing the
// one just before it — `(FacetName | FacetSpec)[], required` keeps its inner
// parentheses.
function typeExpression(text) {
  let depth = 1;
  let i = 0;
  for (; i < text.length && depth > 0; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') depth -= 1;
  }
  return text.slice(0, depth ? i : i - 1);
}

// search_docs's invariant, over a rendered payload. A type REFERENCE is a
// component name in a type position — the parenthesised type of a param, field
// or component head, the named body and response roots, a union's named
// branch — never a prose mention: descriptions cite shapes that live on other
// cards by design.
const COMPONENT_NAMES = new Set(SCHEMA_VALIDATORS.map((v) => v.slice(1)));
const COMPONENTS_HEADER = 'Components — the named types used above:';

function typeReferences(text) {
  const names = new Set();
  const collect = (typeText) => {
    for (const [id] of typeText.matchAll(/\b[A-Z]\w*\b/g)) {
      if (COMPONENT_NAMES.has(id)) names.add(id);
    }
  };
  for (const line of text.split('\n')) {
    const typed = line.match(/^\s*- `?[\w$.-]+`? \((.*)$/) ?? line.match(/^`\w+` \((.*)$/);
    if (typed) collect(typeExpression(typed[1]));
    if (/^(Request body|Response): /.test(line) || /^\s*- `\w+`$/.test(line)) {
      for (const [, id] of line.matchAll(/`(\w+)`/g)) {
        if (COMPONENT_NAMES.has(id)) names.add(id);
      }
    }
  }
  return names;
}

// Split a payload into what the cards render and the Components entries, each
// entry keyed by the name its head defines. Read structurally: a card line that
// merely starts with a backticked name is prose, not a definition.
function payloadParts(payload) {
  const at = payload.indexOf(COMPONENTS_HEADER);
  const cards = at === -1 ? payload : payload.slice(0, at);
  const entries = new Map();
  if (at !== -1) {
    const section = payload
      .slice(at + COMPONENTS_HEADER.length)
      .split('\n\n---\n\n')[0];
    for (const chunk of section.split('\n\n')) {
      const head = chunk.match(/^`(\w+)`/);
      if (head) entries.set(head[1], chunk);
    }
  }
  // A card defines its own root in place: an object root field by field, a
  // list's summary item on the line after its `Response:` head.
  const onCards = new Set();
  const lines = cards.split('\n');
  lines.forEach((line, i) => {
    const root = line.match(/^Response: `(\w+)` →/);
    if (root) onCards.add(root[1]);
    const item = line.match(/^Response: .*\{ data: `(\w+)`\[\]/);
    if (item && lines[i + 1]?.startsWith(`\`${item[1]}\``)) onCards.add(item[1]);
  });
  return { cards, entries, onCards };
}

// Problems for one payload, found by WALKING from the cards: start from the
// types the cards name, follow each reached Components entry to the types it
// names in turn. What is reached must be defined; what is defined must be
// reached. A comparison of global sets would let two definitions that cite each
// other vouch for one another with no card leading to either.
function sweep(label, payload) {
  const { cards, entries, onCards } = payloadParts(payload);
  const reached = new Set(typeReferences(cards));
  const queue = [...reached];
  while (queue.length) {
    const entry = entries.get(queue.pop());
    if (!entry) continue;
    for (const name of typeReferences(entry)) {
      if (!reached.has(name)) {
        reached.add(name);
        queue.push(name);
      }
    }
  }
  return [
    ...[...reached]
      .filter((name) => !entries.has(name) && !onCards.has(name))
      .map((name) => `${label} renders ${name} but never defines it`),
    ...[...entries.keys()]
      .filter((name) => !reached.has(name))
      .map((name) => `${label} defines ${name} but no card leads to it`),
  ];
}

// search_docs is the LLM's entry point — it must surface the right operation
// for a plain-language query, never return an empty list, and hand back enough
// structure (typed params, enums, response shape, a runnable example) to write
// the `execute` body in one shot.

const byId = (id) => OPERATIONS.find((o) => o.id === id);

describe('searchOperations', () => {
  it('ranks the list operation first for a listing query', () => {
    expect(searchOperations('list upcoming events')[0].id).toBe(
      'agendas.events.list',
    );
  });

  it('ranks the facets operation first for an aggregation query', () => {
    // "aggregate" + "breakdown" are facet-specific keywords; "how many"
    // ("events per city" would tie with the list op, which also keys on city).
    expect(searchOperations('aggregate breakdown counts')[0].id).toBe(
      'agendas.events.facets',
    );
  });

  it('ranks the get operation first for a single-detail query', () => {
    expect(searchOperations('get one event by uid')[0].id).toBe(
      'agendas.events.get',
    );
  });

  it('ranks facets first for an aggregation phrase', () => {
    // "how many" is a facets synonym; it should surface the aggregation op.
    expect(searchOperations('how many')[0].id).toBe('agendas.events.facets');
  });

  // Relevance regressions caught in review: short-term fuzzy matching and an
  // indexed prose `description` (which cross-references other operationIds) used
  // to surface the wrong operation for plain-language queries.
  it('does not let a short fuzzy match surface the wrong op', () => {
    // "show" must NOT fuzzy-match the facets keyword "how" — a listing query
    // stays on the listing op.
    expect(searchOperations('show events')[0].id).toBe('agendas.events.list');
    expect(searchOperations('show me events')[0].id).toBe(
      'agendas.events.list',
    );
  });

  // Queries are addressed to an assistant, so they arrive padded with filler.
  // Every phrasing below used to return `me.agendas.list`: its id carries the
  // singleton "me", and its summary ("List THE agendas YOU are a member of")
  // carried the singleton "the"/"you" — two different high-IDF collisions, so
  // an earlier fix that only damped 1–2 character tokens left the "the"/"you"
  // half of this list red. Sweep the phrasings, not one specimen.
  it.each([
    'show me events',
    'show me the events',
    'give me the events',
    'give me the list of events',
    'can you show me events',
    'show me upcoming events',
  ])('keeps a padded listing query on the listing op: %p', (query) => {
    expect(searchOperations(query)[0].id).toBe('agendas.events.list');
  });

  // The other half of that trade-off: filler must be demoted, never muted, or
  // the operation those same short words genuinely ASK for stops being
  // reachable. Both directions belong here — a fix for one breaks the other.
  it('still ranks the me.* op first when short words are the actual intent', () => {
    expect(searchOperations('my agendas')[0].id).toBe('me.agendas.list');
    expect(searchOperations('list my agendas')[0].id).toBe('me.agendas.list');
    expect(searchOperations('memberships')[0].id).toBe('me.agendas.list');
    expect(searchOperations('me')[0].id).toBe('me.agendas.list');
  });

  // Top-1 is not the contract; the RICH CARD is. The first three hits render in
  // full, so what an LLM needs is the intended operation among them. Tuning
  // for top-1 on plain-language phrasings is a trade, not a fix — measured on a
  // wider set, bounding prefix expansion or stripping stop words from the query
  // flips as many phrasings the wrong way as it rescues ("show me the events of
  // my agenda" → me.agendas.list, "find concerts in lyon" → agendas.list). So
  // pin what holds: these phrasings, several of which rank a sibling first,
  // keep the operation they mean on a full card.
  it.each([
    ['what events do we have', 'agendas.events.list'],
    ['events we like', 'agendas.events.list'],
    ['what is on this week', 'agendas.events.list'],
    ['show events for my agenda', 'agendas.events.list'],
    ['get me all the events', 'agendas.events.list'],
    ['find concerts in lyon', 'agendas.events.list'],
    ['show me the events of my agenda', 'agendas.events.list'],
    ['which agendas am i a member of', 'me.agendas.list'],
    ['find an agenda', 'agendas.list'],
    ['add a new event', 'agendas.events.create'],
    ['remove an event', 'agendas.events.delete'],
    ['upload an image', 'agendas.uploads.create'],
    ['what fields does the form have', 'agendas.events.schema'],
    ['find event by external id', 'agendas.events.getByExtId'],
    ['distribution of events by month', 'agendas.events.facets'],
  ])('keeps %p on a rich card for %s', (query, id) => {
    const payload = renderSearch(searchOperations(query));
    expect(payload).toContain(`### ${id}\n`);
  });

  it('ranks the listing op first for the bare resource term', () => {
    expect(searchOperations('events')[0].id).toBe('agendas.events.list');
  });

  it('does not let cross-referenced ids in prose distort ranking', () => {
    // The facets description mentions `agendas.events.list`; a bare "agendas"
    // query must still surface an agenda-level op, not facets.
    expect(searchOperations('agendas')[0].id).toBe('agendas.list');
  });

  // The plain-language verbs below come ONLY from the contract's `x-synonyms`
  // extension (not the id/summary/param names), so these also prove that path is
  // wired: a route's synonyms travel with it in the spec.
  it('routes a "fetch … by id" query to the get op via x-synonyms', () => {
    expect(searchOperations('fetch event by id')[0].id).toBe(
      'agendas.events.get',
    );
  });

  it('routes a "browse" query to the listing op via x-synonyms', () => {
    expect(searchOperations('browse agendas')[0].id).toBe('agendas.list');
  });

  it("carries the contract x-synonyms into an operation's keywords", () => {
    // "breakdown" is a facets x-synonym with no structural source — its presence
    // in keywords proves the extension is merged in.
    expect(byId('agendas.events.facets').keywords).toContain('breakdown');
  });

  it('returns ALL operations when nothing matches (never empty)', () => {
    const hits = searchOperations('zzzzz-nonsense');
    expect(hits).toHaveLength(OPERATIONS.length);
  });

  it('is case-insensitive', () => {
    expect(searchOperations('FACETS')[0].id).toBe('agendas.events.facets');
  });

  it.each([null, undefined, ''])('handles %p without throwing', (q) => {
    expect(() => searchOperations(q)).not.toThrow();
    expect(searchOperations(q).length).toBeGreaterThan(0);
  });
});

describe('structured params (derived from the contract)', () => {
  const list = byId('agendas.events.list');

  it('includes the path param, marked required and typed', () => {
    const agendaUid = list.params.find((p) => p.name === 'agendaUid');
    expect(agendaUid).toMatchObject({
      in: 'path',
      required: true,
      type: 'integer',
    });
  });

  it('surfaces enum values on a filter param', () => {
    const relative = list.params.find((p) => p.name === 'relative');
    expect(relative.enum).toEqual(['passed', 'upcoming', 'current']);
  });

  it('resolves a $ref enum (and its x-enum-descriptions) through to the param', () => {
    // `status` items are a $ref to the shared EventStatus component; deriveParams
    // must deref it so the values and labels reach the LLM (else they vanish).
    const status = list.params.find((p) => p.name === 'status');
    expect(status.enum).toEqual([1, 2, 3, 4, 5, 6]);
    expect(status.enumDescriptions).toMatchObject({
      1: 'Scheduled',
      6: 'Cancelled',
    });
    // The $ref keeps its component name — the same name the response fields,
    // the Components definition and the zod validator use. The passable values
    // still render inline on the param line, so the name is never a blocker.
    expect(status.type).toBe('EventStatus[]');
  });

  it('reads x-enum-descriptions off a direct (non-$ref) enum schema', () => {
    const sort = list.params.find((p) => p.name === 'sort');
    expect(sort.enumDescriptions.score).toMatch(/relevance/i);
  });

  it('lifts default/min/max off the schema', () => {
    const limit = list.params.find((p) => p.name === 'limit');
    expect(limit).toMatchObject({ default: 20, min: 1, max: 100 });
  });

  it('resolves array item types', () => {
    const city = list.params.find((p) => p.name === 'city');
    expect(city.type).toBe('string[]');
  });
});

describe('response shape (derived from the success body)', () => {
  it('models a list endpoint as data[] + pagination, summary variant first', () => {
    const { response } = byId('agendas.events.list');
    expect(response.kind).toBe('list');
    expect(response.root).toBe('EventList');
    expect(response.pagination).toBe('Pagination');
    expect(response.item.variants).toEqual(['EventSummary', 'Event']);
    const fields = response.item.fields.map((f) => f.name);
    expect(fields).toEqual(
      expect.arrayContaining(['title', 'dateRange', 'location']),
    );
  });

  it('models a single-resource endpoint as a flat object', () => {
    const { response } = byId('agendas.events.get');
    expect(response.kind).toBe('object');
    expect(response.root).toBe('Event');
  });

  it('models the facets endpoint', () => {
    const { response } = byId('agendas.events.facets');
    expect(response.root).toBe('FacetResults');
  });

  // A creation answers 201, not 200. Reading the body from a hardcoded '200'
  // left this op — and only this op — with no response shape at all, so its
  // card documented a call whose result it could not describe, and named zero
  // components for the payload's Components section.
  it('reads the body of a 201-only creation', () => {
    const { response, componentRefs } = byId('agendas.events.create');
    expect(response).not.toBeNull();
    expect(response.kind).toBe('object');
    expect(response.root).toBe('Event');
    expect(componentRefs).toContain('Event');
    expect(componentRefs).toContain('EventStatus');
  });

  // No test pins the lowest-2xx tie-break on purpose: every op in the contract
  // that declares both 200 and 201 (the by-ext upserts) points them at the SAME
  // `Event` component, so an assertion on the resolved root holds whichever
  // status wins and would pass against a reversed sort. A test that cannot fail
  // is worse than none — the rule is documented on `successBody` instead.

  // The shapes below are legal OpenAPI the contract does not use today; each
  // one used to read as "no response" or "no fields", silently.
  describe('success body selection', () => {
    const schema = { type: 'object', properties: { ok: { type: 'boolean' } } };
    const json = (type = 'application/json') => ({
      content: { [type]: { schema } },
    });

    it('reads a 2XX range response', () => {
      expect(successBody({ responses: { '2XX': json() } })).toBe(schema);
    });

    it('prefers an explicit status over the range', () => {
      const explicit = { type: 'string' };
      expect(
        successBody({
          responses: {
            '2XX': json(),
            201: { content: { 'application/json': { schema: explicit } } },
          },
        }),
      ).toBe(explicit);
    });

    it('matches a JSON media type by word, whatever its case or suffix', () => {
      expect(
        successBody({
          responses: { 200: json('Application/JSON; charset=utf-8') },
        }),
      ).toBe(schema);
      expect(
        successBody({ responses: { 200: json('application/problem+json') } }),
      ).toBe(schema);
    });

    it('does not take a parameter mentioning json for a JSON type', () => {
      expect(
        successBody({ responses: { 200: json('text/plain; profile=json') } }),
      ).toBeUndefined();
    });

    it('does not read `default`, which covers errors too', () => {
      expect(successBody({ responses: { default: json() } })).toBeUndefined();
    });
  });

  it('renders an allOf-wrapped root inline, from its merged fields', () => {
    const response = deriveResponse({
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/Event' },
                  { description: 'The event as stored' },
                ],
              },
            },
          },
        },
      },
    });
    // Only a bare `$ref` names a component: a wrapper may constrain what it
    // wraps, and the component's own definition would then document the wrong
    // shape.
    expect(response.root).toBeNull();
    expect(response.fields.map((f) => f.name)).toContain('uid');
  });

  it('renders the fields of an inline list item that has no component name', () => {
    const response = deriveResponse({
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      oneOf: [
                        {
                          type: 'object',
                          required: ['id'],
                          properties: { id: { type: 'integer' } },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const card = renderOperation(
      {
        ...byId('agendas.list'),
        response,
      },
      0,
    );
    expect(card).toContain('- id (integer, required)');
  });

  it('types the list pagination so its component is reachable', () => {
    const card = renderOperation(byId('agendas.events.list'), 0);
    expect(card).toContain('pagination: `Pagination` }');
  });

  it('resolves allOf-wrapped field types by name (not "any")', () => {
    // dateRange is `allOf: [$ref LocalizedString]`; it must keep its schema name.
    const { response } = byId('agendas.events.list');
    const dateRange = response.item.fields.find((f) => f.name === 'dateRange');
    expect(dateRange.type).toBe('LocalizedString');
  });

  it('keeps the enum COMPONENT NAME on response fields', () => {
    // Reading side: `status: 6` in an execute result is decoded through the
    // EventStatus definition in the Components section — the name is the join
    // key, so it must NOT collapse to `integer`.
    const { response } = byId('agendas.events.get');
    const status = response.fields.find((f) => f.name === 'status');
    expect(status.type).toBe('EventStatus');
  });

  it("carries each field's own description", () => {
    const { response } = byId('agendas.events.get');
    const dateRange = response.fields.find((f) => f.name === 'dateRange');
    expect(dateRange.description).toMatch(/localized date range/i);
    // A bare-$ref field has no own description — the component definition in
    // the Components section carries the semantics, not every field line.
    const status = response.fields.find((f) => f.name === 'status');
    expect(status.description).toBe('');
  });
});

describe('request body (derived from the contract)', () => {
  // The catalogue described what came BACK and never what to send: the write
  // cards rendered a signature with no `body`, and `EventInput` — named in
  // their own prose — was defined nowhere in the payload. The LLM got 40 typed
  // response fields and had to guess a ~40-field input from a 6-field example.
  it('derives the JSON body of a write operation', () => {
    const { request } = byId('agendas.events.create');
    expect(request).toMatchObject({
      root: 'EventInput',
      contentType: 'application/json',
      required: true,
    });
    expect(request.fields.length).toBeGreaterThan(0);
  });

  it('distinguishes the full input from the patch variant', () => {
    expect(byId('agendas.events.update').request.root).toBe('EventInput');
    expect(byId('agendas.events.patch').request.root).toBe('EventPatch');
  });

  it('carries a multipart body with no component to name', () => {
    const { request } = byId('agendas.uploads.create');
    expect(request.contentType).toBe('multipart/form-data');
    expect(request.root).toBeNull();
  });

  it('leaves a read operation without a body', () => {
    expect(byId('agendas.events.list').request).toBeNull();
    expect(byId('agendas.events.get').request).toBeNull();
  });

  it('names the body in the call signature', () => {
    expect(byId('agendas.events.create').call).toContain('body');
    expect(byId('agendas.events.list').call).not.toContain('body');
  });

  it('defines the body component in the payload it is named in', () => {
    const payload = renderSearch(searchOperations('create an event'));
    expect(payload).toContain('Request body: `EventInput`');
    // Named on the card, defined once in the Components section — not inlined
    // on each of the four write cards that share it.
    expect(payload).toMatch(/(^|\n)`EventInput`[ (\n]/);
  });

  it('marks a required body field in its component definition', () => {
    expect(renderComponentDef('Timing')).toContain(
      '- begin (string, required)',
    );
  });

  it('parenthesises a union inside an array', () => {
    expect(renderComponentDef('FacetReportRequest')).toContain(
      '(FacetName | FacetSpec)[]',
    );
  });

  it('renders the fields of a body that has no component to name', () => {
    const card = renderOperation(byId('agendas.uploads.create'), 0);
    expect(card).toContain('Request body: multipart/form-data, required');
    // Marked required like any component property: the inline path used to
    // drop the marker, so the one field an upload needs read as optional.
    expect(card).toContain('- file (string, required)');
  });

  it('keeps the fields of a body wrapped in allOf', () => {
    const request = deriveRequest({
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/EventInput' },
                { description: 'Refined for this route' },
              ],
            },
          },
        },
      },
    });
    expect(request.root).toBeNull();
    expect(request.fields.length).toBeGreaterThan(0);
  });

  it('marks a field an allOf member makes required', () => {
    const request = deriveRequest({
      requestBody: {
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/EventInput' },
                { required: ['image'] },
              ],
            },
          },
        },
      },
    });
    expect(request.root).toBeNull();
    expect(request.fields.find((f) => f.name === 'image').required).toBe(true);
  });

  it('merges a property several members declare instead of keeping the last', () => {
    const request = deriveRequest({
      requestBody: {
        content: {
          'application/json': {
            schema: {
              allOf: [
                { properties: { x: { type: 'string', enum: ['a', 'b'] } } },
                { properties: { x: { description: 'Refined' } } },
              ],
            },
          },
        },
      },
    });
    expect(request.fields).toEqual([
      expect.objectContaining({
        name: 'x',
        type: 'string',
        enum: ['a', 'b'],
        description: 'Refined',
      }),
    ]);
  });

  // A cycle the unfolding cannot see by name: the self-reference hides inside
  // nested compositions (a `$ref` resolves to the same object every time, which
  // is what this identity stands for), or the parser materialised a YAML alias.
  it('leaves a cyclic inline shape folded instead of overflowing the stack', () => {
    const node = { type: 'object', properties: { id: { type: 'integer' } } };
    node.properties.child = { allOf: [{ allOf: [node] }] };
    node.properties.children = { type: 'array', items: node };
    const request = deriveRequest({
      requestBody: { content: { 'application/json': { schema: node } } },
    });
    expect(request.fields.map((f) => f.name)).toEqual([
      'id',
      'child',
      'children',
    ]);
    expect(
      request.fields.find((f) => f.name === 'child').fields,
    ).toBeUndefined();
  });

  it('picks the JSON media type, not a parameter mentioning json', () => {
    const request = deriveRequest({
      requestBody: {
        content: {
          'text/plain; profile=json': { schema: { type: 'string' } },
          'application/json': {
            schema: { $ref: '#/components/schemas/EventInput' },
          },
        },
      },
    });
    expect(request.contentType).toBe('application/json');
  });

  it('merges an inline allOf body, required markers included', () => {
    const request = deriveRequest({
      requestBody: {
        content: {
          'application/json': {
            schema: {
              allOf: [
                {
                  type: 'object',
                  required: ['a'],
                  properties: { a: { type: 'string' } },
                },
                { type: 'object', properties: { b: { type: 'integer' } } },
              ],
            },
          },
        },
      },
    });
    expect(request.root).toBeNull();
    expect(request.fields).toEqual([
      expect.objectContaining({ name: 'a', required: true }),
      expect.objectContaining({ name: 'b', required: false }),
    ]);
  });
});

// A query renders only three cards richly, so an operation can be shadowed by a
// sibling that happens to define the same component. Render each one ALONE, so
// the invariant is proved per card rather than per page.
describe('every card defines exactly the types it leads to', () => {
  it('holds for every operation rendered on its own', () => {
    // Collect the whole set before asserting: a failure should name every card
    // that regressed, not just the first one to trip.
    const problems = OPERATIONS.flatMap((op) =>
      sweep(op.id, renderSearch([op])));
    expect(problems).toEqual([]);
  });

  // The sweep must be able to fail, or it proves nothing. Pin that it sees each
  // kind of type position — a sweep blind to one would pass a card that drops
  // that side's definitions.
  it('reads every kind of type position', () => {
    expect([
      ...typeReferences(renderSearch([byId('agendas.events.create')])),
    ]).toEqual(expect.arrayContaining(['EventInput', 'ImageInput', 'Event']));
    expect([
      ...typeReferences('Request body: `EventInput` (application/json)'),
    ]).toEqual(['EventInput']);
    expect([
      ...typeReferences(
        '- facets (Record<string, FacetReportEntry>, required)',
      ),
    ]).toEqual(['FacetReportEntry']);
    expect([
      ...typeReferences('- status (EventStatus) — see `Timing` in prose'),
    ]).toEqual(['EventStatus']);
  });

  // Each way the sweep must fail, on a hand-built payload.
  describe('sweep', () => {
    const withComponents = (cards, ...defs) =>
      `${cards}\n\n---\n\n${COMPONENTS_HEADER}\n\n${defs.join('\n\n')}\n\n---\n\nValidators: …`;

    it('reports a name a card renders but the payload never defines', () => {
      expect(
        sweep('x', 'Request body: `EventInput` (application/json)'),
      ).toEqual(['x renders EventInput but never defines it']);
    });

    it('reports a definition no card leads to', () => {
      expect(
        sweep(
          'x',
          withComponents(
            '### op',
            '`EventStatus` (integer) — Values: 1 = Scheduled.',
          ),
        ),
      ).toEqual(['x defines EventStatus but no card leads to it']);
    });

    it('does not let two definitions that cite each other vouch for one another', () => {
      const payload = withComponents(
        '### op',
        '`EventInput` — input\n- image (ImageInput)',
        '`ImageInput` — image\n- event (EventInput)',
      );
      expect(sweep('x', payload)).toEqual([
        'x defines EventInput but no card leads to it',
        'x defines ImageInput but no card leads to it',
      ]);
      // The same pair, once a card names one of them, is fully reached.
      expect(
        sweep(
          'x',
          payload.replace(
            '### op',
            'Request body: `EventInput` (application/json)',
          ),
        ),
      ).toEqual([]);
    });

    it('does not take a prose line starting with a backticked name for a definition', () => {
      expect(
        sweep(
          'x',
          'Response: `Event` →\n- timings (Timing[])\n`Timing` is described on another card',
        ),
      ).toEqual(['x renders Timing but never defines it']);
    });
  });
});

// Shapes the renderer cannot show yet. None is in the contract today, so
// supporting them would be speculative code; instead this fails the day one
// arrives, naming what `search_docs` must learn — rather than letting a card
// silently drop what the contract says.
function unrenderableShapes(contract) {
  const found = [];
  const hasOwnFields = (schema) =>
    !!schema && !schema.$ref && !!schema.properties;
  const deref = (node) =>
    (node?.$ref
      ? node.$ref
        .replace(/^#\//, '')
        .split('/')
        .reduce((n, k) => n?.[k], contract)
      : node);

  // `position` says what already handles the node: a component root renders its
  // union branches and merges its `allOf`; a list's `data` items fall back to
  // the fields of an inline variant. Components are walked on their own, so a
  // `$ref` is never followed.
  const walk = (schema, where, position) => {
    if (!schema || typeof schema !== 'object' || schema.$ref) return;
    if (schema.patternProperties) {
      found.push(
        `${where}: patternProperties — the key patterns are not rendered`,
      );
    }
    if (hasOwnFields(schema.additionalProperties)) {
      found.push(
        `${where}: a map of inline objects — the values' fields are not rendered`,
      );
    }
    const union = schema.oneOf ?? schema.anyOf;
    if (
      union?.some(hasOwnFields)
      && position !== 'component'
      && position !== 'list item'
    ) {
      found.push(
        `${where}: an inline union with an object branch — its fields are not rendered`,
      );
    }
    if (schema.allOf?.some((member) => member.$ref)) {
      if (position === 'body') {
        found.push(
          `${where}: a body wrapped in allOf around a component — renders inline, leaving that component defined with no card leading to it`,
        );
      } else if (position !== 'component' && schema.allOf.some(hasOwnFields)) {
        found.push(
          `${where}: allOf adding fields to a component — the added fields are not rendered`,
        );
      }
    }
    const root = position === 'component' || position === 'body';
    for (const [name, property] of Object.entries(schema.properties ?? {})) {
      walk(
        property,
        `${where}.${name}`,
        root && name === 'data' ? 'data' : 'property',
      );
    }
    walk(
      schema.items,
      `${where}[]`,
      position === 'data' ? 'list item' : 'item',
    );
    if (typeof schema.additionalProperties === 'object') {
      walk(schema.additionalProperties, `${where}{}`, 'value');
    }
    for (const key of ['allOf', 'oneOf', 'anyOf']) {
      (schema[key] ?? []).forEach((member, i) =>
        walk(member, `${where}.${key}[${i}]`, 'member'));
    }
  };

  for (const [name, schema] of Object.entries(
    contract.components?.schemas ?? {},
  )) {
    walk(schema, name, 'component');
  }
  for (const item of Object.values(contract.paths ?? {})) {
    for (const op of Object.values(item)) {
      if (!op?.operationId) continue;
      const bodies = [
        ['request', deref(op.requestBody)],
        ...Object.entries(op.responses ?? {}).map(([code, r]) => [
          code,
          deref(r),
        ]),
      ];
      for (const [label, body] of bodies) {
        for (const [type, media] of Object.entries(body?.content ?? {})) {
          walk(media.schema, `${op.operationId} ${label} ${type}`, 'body');
        }
      }
      for (const param of (op.parameters ?? []).map(deref)) {
        walk(param.schema, `${op.operationId} param ${param.name}`, 'param');
      }
    }
  }
  return found;
}

describe('contract shapes search_docs cannot render yet', () => {
  it('none is used by the contract', () => {
    expect(unrenderableShapes(spec)).toEqual([]);
  });

  // The canary must be able to fire, or it guards nothing.
  it('reports each of them', () => {
    const object = { type: 'object', properties: { x: { type: 'string' } } };
    const ref = { $ref: '#/components/schemas/Named' };
    const contract = {
      components: {
        schemas: {
          Named: object,
          Patterns: {
            type: 'object',
            patternProperties: { '^x-': { type: 'string' } },
          },
          MapOfObjects: { type: 'object', additionalProperties: object },
          WithUnion: {
            type: 'object',
            properties: { u: { oneOf: [object, { type: 'null' }] } },
          },
          WithRefinement: {
            type: 'object',
            properties: { r: { allOf: [ref, object] } },
          },
          // Handled today, so never reported: a component-level union and
          // allOf, and an inline variant in a list's `data` items.
          Union: { oneOf: [object, { type: 'null' }] },
          Merged: { allOf: [ref, object] },
          List: {
            type: 'object',
            properties: { data: { type: 'array', items: { oneOf: [object] } } },
          },
        },
      },
      paths: {
        '/x': {
          post: {
            operationId: 'x.create',
            requestBody: {
              content: { 'application/json': { schema: { allOf: [ref] } } },
            },
            responses: {},
          },
        },
      },
    };
    expect(unrenderableShapes(contract)).toEqual([
      'Patterns: patternProperties — the key patterns are not rendered',
      "MapOfObjects: a map of inline objects — the values' fields are not rendered",
      'WithUnion.u: an inline union with an object branch — its fields are not rendered',
      'WithRefinement.r: allOf adding fields to a component — the added fields are not rendered',
      'x.create request application/json: a body wrapped in allOf around a component — renders inline, leaving that component defined with no card leading to it',
    ]);
  });
});

describe('componentRefs (transitive component collection)', () => {
  it('collects the components the success body references, root included', () => {
    const { componentRefs } = byId('agendas.events.list');
    expect(componentRefs).toEqual(
      expect.arrayContaining([
        'EventList',
        'EventSummary',
        'Event',
        'EventStatus',
        'LocalizedString',
        'Pagination',
      ]),
    );
  });

  it('reaches components nested under inline objects (the facets shapes)', () => {
    // FacetResults nests its bucket types two levels under an inline `facets`
    // object — the traversal must walk inline properties, arrays and
    // additionalProperties, or those names would dangle unrendered.
    const { componentRefs } = byId('agendas.events.facets');
    expect(componentRefs).toEqual(
      expect.arrayContaining([
        'FacetBucket',
        'AdditionalFieldFacet',
        'AdditionalFieldBucket',
        'Timespan',
      ]),
    );
  });

  it('deduplicates: one entry per component name', () => {
    for (const op of OPERATIONS) {
      expect(new Set(op.componentRefs).size).toBe(op.componentRefs.length);
    }
  });

  it('collects components referenced only from PARAM schemas', () => {
    // `accessibility` filters by $ref'd AccessibilityCode values; the response
    // references the Accessibility object but never the code enum — without
    // param-side collection, `accessibility (AccessibilityCode[])` would
    // dangle undefined.
    const { componentRefs } = byId('agendas.events.list');
    expect(componentRefs).toContain('AccessibilityCode');
  });
});

describe('examples', () => {
  it('every SDK-callable operation carries a runnable oa.<id>(…) example', () => {
    for (const op of OPERATIONS.filter((o) => o.sdkCallable)) {
      expect(op.example).toContain(`oa.${op.id}(`);
      expect(op.example).toMatch(/return /);
    }
  });

  // `uploads.staged` is authorized by a single-use X-Upload-Ticket, not by the
  // key or token the `oa` client carries, and its description says as much in
  // as many words: "Call it with a plain HTTPS POST, NOT through the typed API
  // client". Its only curated sample is the curl invocation — which the TS-only
  // filter used to discard, leaving the skeleton to advertise
  // `oa.uploads.staged()`: no ticket, no file, no body, and the one call the
  // contract forbids.
  it('keeps the curated sample of an operation the SDK cannot call', () => {
    const op = byId('uploads.staged');
    expect(op.sdkCallable).toBe(false);
    expect(op.example).not.toContain('oa.uploads.staged(');
    expect(op.example).toContain('curl');
    expect(op.example).toContain('X-Upload-Ticket');
    expect(op.exampleLang).toBe('shell');
    // The signature is the first line the LLM reads — it must not offer a call
    // that cannot authenticate.
    expect(op.call).toBe('POST /uploads/staged');
  });

  it('renders a non-SDK sample under its own fence, not as ts', () => {
    const card = renderOperation(byId('uploads.staged'), 0);
    expect(card).toContain('```shell');
    expect(card).not.toContain('```ts');
    // The SDK does generate a method for the route; what the card must say is
    // that the client's credentials do not authorize it — not that no call
    // exists.
    expect(card).toContain('not through the `oa` client');
  });

  // The distinction is read off each scheme's DEFINITION, not off a list of
  // scheme names: `bearerAuth` is `type: http, scheme: bearer`, `oauth2` is
  // `type: oauth2`, and `uploadTicketAuth` is an `apiKey` in a custom header the
  // client never sets. Pinning the contract's own types here is what makes a
  // renamed scheme keep working and a newly added one get judged on its merits.
  it('judges reachability by the security scheme type, not its name', () => {
    const schemes = spec.components.securitySchemes;
    expect(schemes.bearerAuth).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
    expect(schemes.oauth2).toMatchObject({ type: 'oauth2' });
    expect(schemes.uploadTicketAuth).toMatchObject({
      type: 'apiKey',
      in: 'header',
    });
    // The one operation the client cannot authenticate is the one whose only
    // requirement names that apiKey scheme.
    expect(byId('uploads.staged').scopes).toEqual([]);
    expect(byId('uploads.staged').sdkCallable).toBe(false);
  });

  // Not an exhaustive list of the non-callable routes: a second ticket-style
  // endpoint must need no edit here. Pin both sides structurally instead — the
  // known exception, and every route an Authorization: Bearer can satisfy.
  it('leaves every bearer- or OAuth-secured operation SDK-callable', () => {
    expect(byId('uploads.staged').sdkCallable).toBe(false);
    const secured = Object.values(spec.paths)
      .flatMap((item) => Object.values(item))
      .filter((op) => op?.operationId)
      .filter((op) =>
        (op.security ?? spec.security).some((req) => {
          // All of one requirement's schemes combine, so it counts only when
          // every one of them is a scheme the client carries.
          const schemes = Object.keys(req);
          return (
            schemes.length > 0
            && schemes.every((name) => name === 'bearerAuth' || name === 'oauth2')
          );
        }));
    expect(secured.length).toBeGreaterThan(0);
    for (const op of secured) {
      expect(byId(op.operationId).sdkCallable).toBe(true);
    }
  });

  describe('isSdkCallable (requirement shapes)', () => {
    const contract = {
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
          oauth: { type: 'oauth2' },
          ticket: { type: 'apiKey', in: 'header', name: 'X-Ticket' },
          basic: { type: 'http', scheme: 'basic' },
        },
      },
    };

    it('inherits the document default when the operation declares none', () => {
      expect(isSdkCallable({}, contract)).toBe(true);
      expect(
        isSdkCallable({}, { ...contract, security: [{ ticket: [] }] }),
      ).toBe(false);
    });

    it('treats `security: []` as no auth needed', () => {
      expect(isSdkCallable({ security: [] }, contract)).toBe(true);
    });

    it('treats the empty requirement `{}` as anonymous access', () => {
      expect(isSdkCallable({ security: [{ ticket: [] }, {}] }, contract)).toBe(
        true,
      );
    });

    it('needs EVERY scheme of one requirement, since they combine', () => {
      expect(
        isSdkCallable({ security: [{ bearerAuth: [], ticket: [] }] }, contract),
      ).toBe(false);
      expect(
        isSdkCallable({ security: [{ bearerAuth: [], oauth: [] }] }, contract),
      ).toBe(true);
    });

    it('needs only ONE requirement, since they are alternatives', () => {
      expect(
        isSdkCallable(
          { security: [{ basic: [] }, { oauth: ['x'] }] },
          contract,
        ),
      ).toBe(true);
    });

    it('rejects a scheme the contract does not define', () => {
      expect(isSdkCallable({ security: [{ nope: [] }] }, contract)).toBe(false);
    });
  });

  describe('oauthScopes', () => {
    const contract = {
      security: [{ renamedOAuth: ['events:read'] }],
      components: {
        securitySchemes: {
          renamedOAuth: { type: 'oauth2' },
          bearerAuth: { type: 'http', scheme: 'bearer' },
        },
      },
    };

    it('reads scopes off schemes of type oauth2, whatever their name', () => {
      expect(
        oauthScopes(
          {
            security: [{ bearerAuth: [] }, { renamedOAuth: ['events:write'] }],
          },
          contract,
        ),
      ).toEqual(['events:write']);
    });

    it('inherits the document default', () => {
      expect(oauthScopes({}, contract)).toEqual(['events:read']);
    });

    it('matches the contract on a real operation', () => {
      expect(byId('agendas.events.create').scopes).toEqual(['events:write']);
      expect(byId('uploads.staged').scopes).toEqual([]);
    });
  });

  it('uses the curated x-codeSamples sample when present', () => {
    // agendas.events.list carries a curated TypeScript sample (a paging loop);
    // exampleFor must prefer it over the auto skeleton.
    const { example } = byId('agendas.events.list');
    expect(example).toContain('agendaUid');
    expect(example).toContain('do {');
  });

  describe('auto-derived skeleton (skeletonExample)', () => {
    it('fills the required path param and checks {data,error}', () => {
      const ex = skeletonExample('agendas.events.get', [
        { name: 'agendaUid', in: 'path', required: true, type: 'integer' },
        { name: 'eventUid', in: 'path', required: true, type: 'integer' },
      ]);
      expect(ex).toContain('path: { agendaUid: 123, eventUid: 123 }');
      expect(ex).toContain('if (error) throw error;');
    });

    it('wraps an array-enum param in an array literal (not a bare scalar)', () => {
      // Regression: an enum lifted from items.enum belongs to an array param and
      // must still be wrapped — `['cities']`, not `"cities"`.
      const ex = skeletonExample('agendas.events.facets', [
        { name: 'agendaUid', in: 'path', required: true, type: 'integer' },
        {
          name: 'facets',
          in: 'query',
          required: true,
          type: 'string[]',
          enum: ['cities', 'regions'],
        },
      ]);
      expect(ex).toContain('query: { facets: ["cities"] }');
    });

    it('omits required query params that have none', () => {
      const ex = skeletonExample('agendas.get', [
        { name: 'agendaUid', in: 'path', required: true, type: 'integer' },
      ]);
      expect(ex).toContain('oa.agendas.get({ path: { agendaUid: 123 } })');
    });
  });

  // Anti-drift: any param identifier used as a key in an example's path/query
  // object MUST be a real param of the operation — catches a curated
  // x-codeSamples sample (or skeleton) that drifts from a renamed param.
  // Anti-drift: every key an example passes — in `path`, `query` or `body` —
  // must exist on the operation that call targets, so a curated sample cannot
  // drift from a renamed param or body field.
  it('example keys all reference the operation they are passed to', () => {
    const problems = [];
    const checked = { params: 0, body: 0 };
    for (const op of OPERATIONS) {
      for (const call of exampleCalls(op.example)) {
        const target = byId(call.id);
        const params = new Set(target?.params.map((p) => p.name));
        const fields = new Set(target?.request?.fields.map((f) => f.name));
        for (const key of [...call.path, ...call.query]) {
          checked.params += 1;
          if (!params.has(key)) problems.push(`${op.id} example passes ${key} to ${call.id}`);
        }
        for (const key of call.body) {
          checked.body += 1;
          if (!fields.has(key)) problems.push(`${op.id} example sends ${key} to ${call.id}`);
        }
      }
    }
    expect(problems).toEqual([]);
    // Dozens of keys between the samples; too few means the extractor stopped
    // finding calls, not that every sample is clean.
    expect(checked.params).toBeGreaterThan(20);
    expect(checked.body).toBeGreaterThan(10);
  });

  it('the example extractor reads each call, shorthand and quoted keys, not nested ones', () => {
    expect(
      exampleCalls(
        'await oa.a.create({ path: { x: 1 }, body: { file } });\n'
          + "await oa.b.update ({ query: { extId: { key: 'a' }, after }, "
          + "body: { 'title': { fr: 'It\\'s, b: c' }, image: { ref } } });",
      ),
    ).toEqual([
      { id: 'a.create', path: ['x'], query: [], body: ['file'] },
      {
        id: 'b.update',
        path: [],
        query: ['extId', 'after'],
        body: ['title', 'image'],
      },
    ]);
  });
});

describe('enumSchemaOf — resolves the enum through every wrapper', () => {
  // A param's enum can be modelled many ways; deriveParams must surface its
  // values + x-enum-descriptions regardless, or the LLM loses the passable set.
  const hasLabels = (s) =>
    s && Array.isArray(s.enum) && !!s['x-enum-descriptions'];

  it('direct $ref to a shared enum', () => {
    const s = enumSchemaOf({ $ref: '#/components/schemas/EventStatus' });
    expect(hasLabels(s)).toBe(true);
    expect(s['x-enum-descriptions']['1']).toBe('Scheduled');
  });

  it('array items $ref (the `status` filter shape)', () => {
    const s = enumSchemaOf({
      type: 'array',
      items: { $ref: '#/components/schemas/AccessibilityCode' },
    });
    expect(hasLabels(s)).toBe(true);
    expect(s.enum).toContain('hi');
  });

  it('allOf-wrapped $ref (the `state` field shape)', () => {
    const s = enumSchemaOf({
      allOf: [{ $ref: '#/components/schemas/ModerationState' }],
    });
    expect(hasLabels(s)).toBe(true);
    expect(s.enum).toContain(-2);
  });

  it('nullable inline enum (type: [integer, null])', () => {
    const inline = { type: ['integer', 'null'], enum: [1, 2, null] };
    expect(enumSchemaOf(inline)).toBe(inline);
  });

  it('returns undefined for a non-enum schema (no false positives)', () => {
    expect(enumSchemaOf({ type: 'string' })).toBeUndefined();
    expect(
      enumSchemaOf({ $ref: '#/components/schemas/Event' }),
    ).toBeUndefined();
    expect(enumSchemaOf(undefined)).toBeUndefined();
  });
});

describe('renderOperation', () => {
  it('renders a rich block (rank 0): signature, params, response, example', () => {
    const md = renderOperation(byId('agendas.events.list'), 0);
    expect(md).toContain('### agendas.events.list');
    expect(md).toContain(
      '`oa.agendas.events.list({ path: { agendaUid }, query })`',
    );
    expect(md).toContain('GET /agendas/{agendaUid}/events');
    expect(md).toContain('Parameters:');
    // enum values surfaced inline for the LLM
    expect(md).toMatch(/relative.*passed, upcoming, current/s);
    // a $ref'd enum surfaces its values WITH their labels, `value = label` so
    // the passable value stays unmistakable from its gloss
    expect(md).toMatch(/status.*one of: 1 = Scheduled/s);
    expect(md).toContain('6 = Cancelled');
    expect(md).toContain('Response:');
    expect(md).toContain('EventSummary');
    expect(md).toContain('Example:');
  });

  it('renders a compact one-liner past the rank cutoff', () => {
    const md = renderOperation(byId('agendas.events.list'), 5);
    expect(md).toContain('### agendas.events.list');
    expect(md).toContain('`oa.agendas.events.list(');
    expect(md).not.toContain('Parameters:');
    expect(md).not.toContain('Example:');
  });
});

// The spec orders the DETAILED branch first in every summary/detailed oneOf
// (load-bearing for the generated zod client), while deriveResponse re-derives
// the summary branch structurally (smaller property set). Two encodings of one
// invariant — pin the outcome for every current pair so they can never drift
// apart silently (a property-count tie or an allOf-composed branch would).
describe('summary/detailed variant resolution', () => {
  it.each([
    ['agendas.list', ['AgendaSummary', 'AgendaDetailed']],
    ['agendas.events.list', ['EventSummary', 'Event']],
    ['agendas.locations.list', ['LocationSummary', 'Location']],
    ['me.agendas.list', ['MeAgendaItem', 'MeAgendaItemDetailed']],
  ])('%s leads with the summary variant', (id, variants) => {
    expect(byId(id).response.item.variants).toEqual(variants);
  });
});

describe('renderSearch', () => {
  it('appends the validators footer with the contract-derived list', () => {
    const text = renderSearch(searchOperations('events'));
    expect(text).toContain('schemas');
    expect(text).toContain('zEvent');
  });

  // The SDK handoff: every search_docs response LEADS with the frame that the
  // rendered `oa.*` calls are the npm package, so an agent building a durable
  // tool reproduces them as SDK calls instead of hand-rolled fetch. Leading,
  // not trailing — the frame must precede the operation detail it qualifies.
  it('leads with the SDK frame pointing at @openagenda/api-client', () => {
    const text = renderSearch(searchOperations('events'));
    expect(text).toContain('@openagenda/api-client');
    expect(text).toContain('client.setConfig(');
    expect(text).toContain('new OpenAgenda()');
    // Precedes the first operation card, not buried after the catalogue.
    expect(text.indexOf('@openagenda/api-client')).toBeLessThan(
      text.indexOf('### '),
    );
  });

  // The list card renders its summary item in full (locality rule); the
  // Components section must not define it a second time.
  it('does not re-define the inline-rendered summary variant in Components', () => {
    const text = renderSearch(searchOperations('list upcoming events'));
    const components = text.slice(text.indexOf('Components — '));
    expect(text).toMatch(/`EventSummary` — Compact event representation/);
    expect(components).not.toContain('`EventSummary` —');
  });

  // The Components section is the response-side complement of the params'
  // inline `one of:` lists — without it, every component name a rich card
  // renders (`status (EventStatus)`) would dangle, and an LLM could not decode
  // the values it reads off an `execute` result.
  describe('Components section', () => {
    const text = renderSearch(searchOperations('get one event by uid'));
    const section = text.slice(text.indexOf('Components — '));

    it('defines every enum component with its decode table', () => {
      expect(section).toMatch(
        /`EventStatus` \(integer\).*1 = Scheduled.*6 = Cancelled/,
      );
      expect(section).toMatch(/`ModerationState` \(integer\).*-2 = Removed/);
    });

    it('defines object components with typed, described property lines', () => {
      // EventLocation.country line: typed by component name AND described.
      expect(section).toMatch(
        /- country \(LocalizedString \| null\) — Localized country label\./,
      );
    });

    it('defines the components that field types reference (no dangling name)', () => {
      // The get card renders `title (LocalizedString)`; the name must be
      // defined in the same payload.
      expect(section).toMatch(
        /`LocalizedString` \(Record<string, string>\) — A string localized per language/,
      );
    });

    it('does NOT redefine a root already rendered inline on a rich card', () => {
      // `Event` is the rank-0 root, rendered field by field on its card — a
      // second definition in the section would be pure duplication.
      expect(section).not.toMatch(/^`Event`[ \n]/m);
      // Each remaining component is defined exactly once (deduped across hits).
      expect(section.match(/`EventStatus` \(integer\)/g)).toHaveLength(1);
    });

    it('surfaces component property semantics (the schemaId discriminant)', () => {
      // The original failure this feature fixes: FormSchemaField.schemaId marks
      // additional fields, but that semantics lived only in the component and
      // never reached the search_docs payload.
      const schemaText = renderSearch(searchOperations('event form schema'));
      expect(schemaText).toContain('`FormSchemaField`');
      expect(schemaText).toMatch(
        /schemaId \(integer \| null\) — .*Non-null marks an/,
      );
    });

    it('renders an inline property enum with null spelled out (not dropped)', () => {
      const schemaText = renderSearch(searchOperations('event form schema'));
      expect(schemaText).toMatch(
        /origin .*one of: tags, categories, custom, null/,
      );
    });

    // The structural invariant of the whole feature: a component name rendered
    // as a type anywhere in the payload is never opaque — it is defined in that
    // same payload, either inline as a rich root or as a Components entry — and
    // no definition is stranded without a type leading to it. Sweeps every
    // query shape we serve.
    it('never renders a dangling component name', () => {
      const queries = [
        'events',
        'get one event by uid',
        'event form schema',
        'aggregate breakdown counts',
        'locations',
        'list my agendas',
        '',
        // Write and upload phrasings: their body types had no coverage here.
        'create an event',
        'update an event',
        'upload an image',
        'upsert by external id',
      ];
      const problems = queries.flatMap((query) => {
        const payload = renderSearch(searchOperations(query));
        // Per query: every page names at least one component (an upload page
        // through its `UploadTicket` root), so an empty set means the sweep
        // stopped seeing types, not that there were none.
        const vacuous = typeReferences(payload).size
          ? []
          : [`${JSON.stringify(query)} yielded no type to check`];
        return [...vacuous, ...sweep(JSON.stringify(query), payload)];
      });
      expect(problems).toEqual([]);
    });
  });
});

describe('renderComponentDef', () => {
  it('renders an enum component as a one-line decode table', () => {
    expect(renderComponentDef('AttendanceMode')).toBe(
      '`AttendanceMode` (integer) — How attendees take part. '
        + 'Values: 1 = Offline (on-site), 2 = Online, 3 = Mixed (on-site and online).',
    );
  });

  it('returns an empty string for an unknown component', () => {
    expect(renderComponentDef('Nope')).toBe('');
  });

  // A union component has no properties of its own; rendered as its prose
  // alone, `ImageInput` — what an event write attaches media with — showed
  // neither `ref` nor `url`.
  it("lists the alternatives of a union, with each inline branch's fields", () => {
    const def = renderComponentDef('ImageInput');
    expect(def).toContain('One of:');
    expect(def).toMatch(/\n- object:\n {2}- ref \(string, required\)/);
    expect(def).toMatch(/\n- object:\n {2}- url \(string, required\)/);
    expect(def).toMatch(/\n- null$/);
  });

  it('names the value type of a map instead of a bare object', () => {
    expect(renderComponentDef('FacetReport')).toContain(
      '- facets (Record<string, FacetReportEntry>, required)',
    );
  });

  it('does not type a map whose values carry only a vendor annotation', () => {
    // `additionalProperties: { x-additionalPropertiesName: … }` names the key,
    // not the values — `Record<string, any>` would be a guess dressed as a type.
    expect(renderComponentDef('AdditionalFields')).toMatch(
      /^`AdditionalFields` \(object\) — /,
    );
  });

  it('unfolds an inline object into its own fields', () => {
    const card = renderOperation(byId('agendas.overview'), 0);
    expect(card).toMatch(
      /- events \(object, required\)\n {2}- published \(PublishedEventStats, required\)/,
    );
  });

  it('indents every level of a nested inline object', () => {
    const request = deriveRequest({
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                a: {
                  type: 'object',
                  properties: {
                    b: {
                      type: 'object',
                      properties: { c: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const card = renderOperation(
      { ...byId('agendas.uploads.create'), request },
      0,
    );
    expect(card).toContain('- a (object)\n  - b (object)\n    - c (string)');
  });

  // An object root renders on its card, not in Components — so it must carry
  // everything its definition would, or that detail exists nowhere.
  it('renders an inline root exactly as its definition would', () => {
    const card = renderOperation(byId('agendas.events.delete'), 0);
    expect(card).toContain('- deleted (boolean, required) — [one of: true]');
    const def = renderComponentDef('DeletionResult').split('\n').slice(1);
    for (const line of def) expect(card).toContain(line);
  });
});

describe('SCHEMA_VALIDATORS', () => {
  it('derives one z<Name> per component schema', () => {
    expect(SCHEMA_VALIDATORS).toEqual(
      expect.arrayContaining(['zEvent', 'zEventList', 'zFacetResults']),
    );
    expect(SCHEMA_VALIDATORS.every((n) => n.startsWith('z'))).toBe(true);
  });
});

describe('OPERATIONS catalogue', () => {
  it('every entry is well-formed (id, call, summary, params, response, example)', () => {
    for (const op of OPERATIONS) {
      expect(typeof op.id).toBe('string');
      // Only the operations the SDK can authenticate are named as `oa.*`.
      expect(op.call).toContain(
        op.sdkCallable ? `oa.${op.id}(` : `${op.method} ${op.path}`,
      );
      expect(op.summary.length).toBeGreaterThan(0);
      expect(Array.isArray(op.keywords)).toBe(true);
      expect(op.keywords.length).toBeGreaterThan(0);
      expect(Array.isArray(op.params)).toBe(true);
      expect(op.response).not.toBeNull();
      expect(op.example.length).toBeGreaterThan(0);
    }
  });
});
