import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  checkContract,
  omissions,
  formatFindings,
  contractWarning,
} from '../src/docs/compat.js';
import {
  renderComponentDef,
  renderEverything,
  renderOperation,
  renderSearch,
  searchOperations,
  OPERATIONS,
} from '../src/docs/operations.js';

const spec = parse(
  readFileSync(
    new URL(import.meta.resolve('@openagenda/api-spec/openapi.yaml')),
    'utf8',
  ),
);

// The renderer's dry run is what the check measures; every call hands it in.
const check = (contract) => checkContract(contract, renderEverything);
const omitted = (contract) => omissions(contract, renderEverything);
const messages = (contract) => check(contract).map((f) => f.message);
const pointers = (contract) => check(contract).map((f) => f.pointer);

// A contract fragment is checked as a whole document - derived and rendered
// like the real one - so each fixture below is a minimal one: the components
// and paths it needs, nothing else. Copied WITHOUT shared references (which
// `structuredClone` keeps), because the record is keyed by node identity: a
// literal shared between a component and an inline branch would be read
// through the component and pass as rendered (which is also what a YAML anchor
// does, and is right).
const contract = (parts) =>
  JSON.parse(JSON.stringify({ openapi: '3.1.0', paths: {}, ...parts }));
const object = { type: 'object', properties: { x: { type: 'string' } } };
const ref = { $ref: '#/components/schemas/Named' };
const operation = (op, schemas = {}, components = {}) =>
  contract({
    components: { schemas: { Named: object, ...schemas }, ...components },
    paths: {
      '/x': { post: { operationId: 'x.create', responses: {}, ...op } },
    },
  });
const withProperty = (schema, schemas = {}) =>
  contract({
    components: {
      schemas: {
        Named: object,
        S: { type: 'object', properties: { a: schema } },
        ...schemas,
      },
    },
  });
const json = (schema) => ({ content: { 'application/json': { schema } } });

describe('the contract stays inside what search_docs can render', () => {
  it('holds for the contract this server ships with', () => {
    // The failure message is the finding list itself: a pointer per node and
    // what the card gets wrong.
    expect(formatFindings(check(spec))).toBe('');
  });

  // Every place the contract states something no card shows, as a position
  // with the author's names generalised. A NEW line here is not a bug - it is
  // a decision: somebody set a field `default`, added a `Location` header,
  // curated a sample in another language, and nothing on the card says so.
  // Read the rendered card, decide whether it must learn the construct, then
  // update this list.
  it('omits exactly these, and knowingly', () => {
    expect(omitted(spec)).toEqual([
      '/components/parameters/*/explode',
      '/components/parameters/*/schema/additionalProperties',
      '/components/parameters/*/schema/additionalProperties/maximum',
      '/components/parameters/*/schema/additionalProperties/minimum',
      '/components/parameters/*/schema/example',
      '/components/parameters/*/schema/format:int64',
      '/components/parameters/*/schema/items/format:int64',
      '/components/parameters/*/schema/items/pattern',
      '/components/parameters/*/schema/minItems',
      '/components/parameters/*/schema/oneOf/*/minimum',
      '/components/parameters/*/schema/properties/*/format:date-time',
      '/components/parameters/*/schema/properties/*/maximum',
      '/components/parameters/*/schema/properties/*/minimum',
      '/components/parameters/*/style',
      '/components/responses',
      '/components/schemas/*/additionalProperties',
      '/components/schemas/*/additionalProperties/x-additionalPropertiesName',
      '/components/schemas/*/example',
      '/components/schemas/*/examples',
      '/components/schemas/*/oneOf/*/properties/*/format:uri',
      '/components/schemas/*/oneOf/*/properties/*/maxLength',
      '/components/schemas/*/properties/*/default',
      '/components/schemas/*/properties/*/format:date-time',
      '/components/schemas/*/properties/*/format:double',
      '/components/schemas/*/properties/*/format:int64',
      '/components/schemas/*/properties/*/format:uri',
      '/components/schemas/*/properties/*/items/properties/*/format:uri',
      '/components/schemas/*/properties/*/maxLength',
      '/components/schemas/*/properties/*/maximum',
      '/components/schemas/*/properties/*/minItems',
      '/components/schemas/*/properties/*/minimum',
      '/components/schemas/*/properties/*/properties/*/additionalProperties/x-additionalPropertiesName',
      '/components/schemas/*/properties/*/properties/*/examples',
      '/components/schemas/*/properties/*/properties/*/format:int64',
      '/components/schemas/*/properties/*/readOnly',
      '/components/securitySchemes/*/description',
      '/components/securitySchemes/*/flows',
      '/components/securitySchemes/*/in',
      '/components/securitySchemes/*/name',
      '/info',
      '/openapi',
      '/paths/*/delete/responses/*',
      '/paths/*/delete/responses/*/description',
      '/paths/*/delete/tags',
      '/paths/*/delete/x-codeSamples/*/label',
      '/paths/*/get/responses/*',
      '/paths/*/get/responses/*/description',
      '/paths/*/get/tags',
      '/paths/*/get/x-codeSamples/*',
      '/paths/*/get/x-codeSamples/*/label',
      '/paths/*/patch/responses/*',
      '/paths/*/patch/responses/*/description',
      '/paths/*/patch/tags',
      '/paths/*/patch/x-codeSamples/*/label',
      '/paths/*/post/responses/*',
      '/paths/*/post/responses/*/content/*/example',
      '/paths/*/post/responses/*/description',
      '/paths/*/post/responses/*/headers',
      '/paths/*/post/tags',
      '/paths/*/post/x-codeSamples/*/label',
      '/paths/*/put/responses/*',
      '/paths/*/put/responses/*/description',
      '/paths/*/put/tags',
      '/paths/*/put/x-codeSamples/*/label',
      '/security',
      '/servers',
      '/tags',
      '/x-tagGroups',
    ]);
  });
});

// Each block below states something the renderer does, and the fixture that
// makes the checker fire on its opposite. A checker that cannot fire guards
// nothing - and one that fires on a shape the renderer DOES handle gets worked
// around instead of read, so the false positives are pinned too.
describe('a keyword nobody classified fails by default', () => {
  it('reports a JSON Schema keyword the renderer never reads', () => {
    for (const keyword of [
      'const',
      'not',
      'if',
      'dependentRequired',
      'dependentSchemas',
      'patternProperties',
      'prefixItems',
      'propertyNames',
      'contains',
      'unevaluatedProperties',
      'contentEncoding',
      'discriminator',
      'nullable',
      '$defs',
      '$anchor',
    ]) {
      const shape = contract({
        components: { schemas: { S: { ...object, [keyword]: {} } } },
      });
      expect(pointers(shape)).toEqual([`/components/schemas/S/${keyword}`]);
    }
  });

  it('reports an unknown vendor extension rather than waving `x-` through', () => {
    // `x-codeSamples` and `x-synonyms` ARE read; a blanket `x-*` pass would let
    // an extension that changes the generated client through unnoticed.
    expect(
      messages(
        contract({
          components: { schemas: { S: { ...object, 'x-oa-secret': true } } },
        }),
      ),
    ).toEqual([
      '`x-oa-secret` - an extension the renderer does not read; decide whether a card must show it',
    ]);
    expect(pointers(operation({ 'x-retry': true }))).toEqual([
      '/paths/~1x/post/x-retry',
    ]);
    expect(pointers({ openapi: '3.1.0', paths: {}, speculative: {} })).toEqual([
      '/speculative',
    ]);
    expect(
      pointers(
        operation({
          parameters: [
            {
              name: 'q',
              in: 'query',
              schema: { type: 'string' },
              speculative: 1,
            },
          ],
        }),
      ),
    ).toEqual(['/paths/~1x/post/parameters/0/speculative']);
  });

  it('reports an unclassified key on a security scheme', () => {
    // Reachability is read off `type` (and `scheme`): a key nobody classified
    // may be the one that decides whether the `oa` client can authenticate.
    expect(
      pointers(
        operation({ security: [{ k: [] }] }, undefined, {
          securitySchemes: {
            k: { type: 'http', scheme: 'bearer', proof: 'dpop' },
          },
        }),
      ),
    ).toEqual(['/components/securitySchemes/k/proof']);
  });
});

describe('a keyword the renderer reads, and then narrows', () => {
  it('reports a `$ref` outside the components the renderer follows', () => {
    expect(pointers(withProperty({ $ref: '#/$defs/Thing' }))).toEqual([
      '/components/schemas/S/properties/a/$ref',
    ]);
  });

  it('accepts a `description` beside a `$ref`, and omits a `default` there', () => {
    // 2020-12 allows siblings; `topLevelFields` reads the property's own
    // description and `resolveType` names the component - both render.
    const described = withProperty({ ...ref, description: 'Refined' });
    expect(messages(described)).toEqual([]);
    const defaulted = withProperty({ ...ref, default: 2 });
    expect(messages(defaulted)).toEqual([]);
    expect(omitted(defaulted)).toContain(
      '/components/schemas/*/properties/*/default',
    );
  });

  it('reports a multi-type schema, but not a nullable one', () => {
    expect(messages(withProperty({ type: ['string', 'integer'] }))).toEqual([
      '`type: [string, integer]` - only the first non-null type is rendered',
    ]);
    expect(messages(withProperty({ type: ['string', 'null'] }))).toEqual([]);
  });

  it('accepts a nullable component root, now that its head says so', () => {
    // This one was a finding until `renderComponentDef` learned to render it:
    // the fields render like any other and the referencing line names the
    // component, so `(object | null)` on the head is where `null` reaches a
    // reader. The rendering itself is pinned in operations.test.js.
    expect(
      messages(
        withProperty(ref, { Named: { ...object, type: ['object', 'null'] } }),
      ),
    ).toEqual([]);
  });

  it('reports a format whose rendering nobody decided, and a binary non-string', () => {
    expect(
      messages(withProperty({ type: 'string', format: 'password' })),
    ).toEqual([
      '`format: password` - decide whether it changes the type the caller must pass, like `binary`, or refines one the card already gives',
    ]);
    expect(
      messages(withProperty({ type: 'integer', format: 'binary' })),
    ).toEqual([
      'a `format: binary` on a non-string - the card keeps the declared type, and the client takes `Blob | File`',
    ]);
  });

  it('reports `anyOf`, which is searched for a name and rendered `any`', () => {
    expect(pointers(withProperty({ anyOf: [ref, { type: 'null' }] }))).toEqual([
      '/components/schemas/S/properties/a/anyOf',
    ]);
  });

  it('reports a boolean schema, which the record cannot see', () => {
    expect(messages(withProperty(true))).toEqual([
      'a boolean schema (`true`/`false` in place of an object) - it renders as `any`',
    ]);
  });
});

describe('a shape whose reference is read and whose contents never are', () => {
  it('reports the fields of an object parameter, which the card shows as `object`', () => {
    const shape = operation({
      parameters: [
        {
          name: 'filter',
          in: 'query',
          style: 'deepObject',
          explode: true,
          schema: {
            type: 'object',
            required: ['from'],
            properties: { from: { type: 'string' }, to: { type: 'string' } },
          },
        },
      ],
    });
    // The 22 `deepObject` filters of the live contract were exactly this, and
    // this is what the check reported until `deriveParams` started carrying
    // their fields. What it proves now is the measurement itself: the keys are
    // read, so nothing is reported.
    expect(pointers(shape)).toEqual([]);
  });

  it('still reports an object parameter whose fields reach no card', () => {
    // The same shape one level further down, where nothing unfolds it: the
    // values of a map are named by type, never by field.
    const shape = operation({
      parameters: [
        {
          name: 'filter',
          in: 'query',
          schema: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: { from: { type: 'string' } },
            },
          },
        },
      ],
    });
    expect(pointers(shape)).toEqual([
      '/paths/~1x/post/parameters/0/schema/additionalProperties/properties/from',
    ]);
    expect(messages(shape)[0]).toBe(
      'nothing in it is read: a declared field nothing renders - the object it belongs to reaches the card as a bare `object`',
    );
  });

  it('reports an inline object branch of a property union, and a map of inline objects', () => {
    expect(
      pointers(withProperty({ oneOf: [object, { type: 'null' }] })),
    ).toEqual(['/components/schemas/S/properties/a/oneOf/0/properties/x']);
    expect(
      pointers(withProperty({ type: 'object', additionalProperties: object })),
    ).toEqual([
      '/components/schemas/S/properties/a/additionalProperties/properties/x',
    ]);
    // A map of NAMED values renders `Record<string, Named>`.
    expect(
      messages(withProperty({ type: 'object', additionalProperties: ref })),
    ).toEqual([]);
  });

  it('reports the fields an `allOf` adds to a referenced component', () => {
    expect(pointers(withProperty({ allOf: [ref, object] }))).toEqual([
      '/components/schemas/S/properties/a/allOf/1/properties/x',
    ]);
    // At a component root the members are merged.
    expect(
      messages(
        contract({
          components: {
            schemas: { Named: object, M: { allOf: [ref, object] } },
          },
        }),
      ),
    ).toEqual([]);
  });

  it('reports the items of a nullable array of inline objects', () => {
    // `topLevelFields` unfolds `items` only when `type` is the string `array`.
    expect(
      pointers(withProperty({ type: ['array', 'null'], items: object })),
    ).toEqual(['/components/schemas/S/properties/a/items/properties/x']);
  });

  it('reports an `enum` beneath a property composition, which no card lists', () => {
    expect(
      pointers(withProperty({ allOf: [{ type: 'integer', enum: [1, 2] }] })),
    ).toEqual(['/components/schemas/S/properties/a/allOf/0/enum']);
  });

  it('reports a union that also declares properties', () => {
    // `objectView` renders the properties and never reads the branches.
    expect(
      pointers(
        contract({
          components: {
            schemas: {
              Named: object,
              S: {
                properties: { a: { type: 'string' } },
                oneOf: [object, ref],
              },
            },
          },
        }),
      ),
    ).toEqual(['/components/schemas/S/oneOf']);
  });
});

describe('a definition nothing on the card leads to', () => {
  it('reports a body that is a union of components', () => {
    // `deriveRequest` reads no `oneOf`: the request line names no component,
    // and both are defined beneath a card that never mentions them.
    expect(
      messages(
        operation(
          {
            requestBody: json({
              oneOf: [ref, { $ref: '#/components/schemas/Other' }],
            }),
          },
          { Other: object },
        ),
      ),
    ).toEqual([
      '`Named` is defined for this card, and nothing on the card leads to it - the shape that references it renders opaque',
      '`Other` is defined for this card, and nothing on the card leads to it - the shape that references it renders opaque',
    ]);
  });

  it('is not led there by the prose', () => {
    // The description cites the members by name, as the live contract's do
    // ("returns the created `Event`"). Prose leads nowhere: matched over the
    // whole card, it vouched for the very body that renders opaque.
    expect(
      pointers(
        operation(
          {
            description: 'Sends a `Named` or an `Other`.',
            requestBody: json({
              oneOf: [ref, { $ref: '#/components/schemas/Other' }],
            }),
          },
          { Other: object },
        ),
      ),
    ).toEqual(['/paths/~1x/post', '/paths/~1x/post']);
  });

  it('reports a response that is a bare array of components', () => {
    expect(
      pointers(
        operation({
          responses: {
            200: { description: 'ok', ...json({ type: 'array', items: ref }) },
          },
        }),
      ),
    ).toEqual(['/paths/~1x/post']);
  });

  it('reports a body wrapped in `allOf` around a component', () => {
    expect(
      pointers(operation({ requestBody: json({ allOf: [ref] }) })),
    ).toEqual(['/paths/~1x/post']);
    // Named directly, the body line leads to it.
    expect(messages(operation({ requestBody: json(ref) }))).toEqual([]);
  });
});

describe('the direction a field is reached from', () => {
  const flagged = (flag, value = true) => ({
    type: 'object',
    properties: { a: { type: 'string', [flag]: value } },
  });

  it('reports `readOnly` a request body reaches through a `$ref`', () => {
    expect(
      check(
        operation({ requestBody: json(ref) }, { Named: flagged('readOnly') }),
      ),
    ).toEqual([
      {
        pointer: '/components/schemas/Named/properties/a/readOnly',
        message:
          '`readOnly` on a field the request body of x.create reaches - the card offers a field the API will refuse',
      },
    ]);
  });

  it('reports `writeOnly` a response reaches, and nothing the other way round', () => {
    const both = operation(
      {
        requestBody: json({ $ref: '#/components/schemas/In' }),
        responses: {
          200: {
            description: 'ok',
            ...json({ $ref: '#/components/schemas/Out' }),
          },
        },
      },
      { In: flagged('writeOnly'), Out: flagged('readOnly') },
    );
    expect(messages(both)).toEqual([]);
    const wrong = operation(
      {
        responses: {
          200: {
            description: 'ok',
            ...json({ $ref: '#/components/schemas/Out' }),
          },
        },
      },
      { Out: flagged('writeOnly') },
    );
    expect(messages(wrong)).toEqual([
      '`writeOnly` on a field the response of x.create reaches - the card promises a field that never comes back',
    ]);
  });

  it('does not take `readOnly: false` for a read-only field', () => {
    expect(
      messages(
        operation(
          { requestBody: json(ref) },
          { Named: flagged('readOnly', false) },
        ),
      ),
    ).toEqual([]);
  });
});

describe('operations, parameters and responses', () => {
  it('reports an operation the catalogue would skip', () => {
    expect(
      messages(contract({ paths: { '/x': { get: { responses: {} } } } })),
    ).toEqual([
      'nothing in it is read: an operation with no `operationId` - it is skipped, and the route is absent from the catalogue',
    ]);
  });

  it('reports a path item that carries parameters or hides behind a $ref', () => {
    expect(
      pointers(
        contract({
          components: { pathItems: { Y: {} } },
          paths: {
            '/x': {
              parameters: [
                { name: 'a', in: 'query', schema: { type: 'string' } },
              ],
              get: { operationId: 'x.get', responses: {} },
            },
            '/y': { $ref: '#/components/pathItems/Y' },
          },
        }),
      ),
    ).toEqual([
      '/paths/~1x/parameters',
      '/paths/~1y/$ref',
      '/components/pathItems',
    ]);
  });

  it('reports a parameter the call signature cannot carry', () => {
    expect(
      messages(
        operation({
          parameters: [
            { name: 'X-Tenant', in: 'header', schema: { type: 'string' } },
            {
              name: 'filter',
              in: 'query',
              content: { 'application/json': { schema: ref } },
            },
          ],
        }),
      ),
    ).toEqual([
      "a `header` parameter - a card's signature carries `path` and `query` only, so `X-Tenant` is invisible",
      'a parameter carried as a media type instead of a `schema` - it renders as `any`',
    ]);
  });

  it('reports a shared parameter once, where it is defined', () => {
    const shared = contract({
      components: {
        parameters: {
          Tenant: {
            name: 'X-Tenant',
            in: 'header',
            schema: { type: 'string' },
          },
        },
      },
      paths: {
        '/a': {
          get: {
            operationId: 'a.get',
            parameters: [{ $ref: '#/components/parameters/Tenant' }],
            responses: {},
          },
        },
        '/b': {
          get: {
            operationId: 'b.get',
            parameters: [{ $ref: '#/components/parameters/Tenant' }],
            responses: {},
          },
        },
      },
    });
    expect(pointers(shared)).toEqual(['/components/parameters/Tenant/in']);
  });

  it('reports two success codes answering with different shapes, not the same', () => {
    const responses = (created) =>
      operation({
        responses: {
          200: { description: 'ok', ...json(ref) },
          201: { description: 'created', ...json(created) },
        },
      });
    expect(messages(responses(ref))).toEqual([]);
    expect(messages(responses(object))).toEqual([
      'a second success response with a different shape - only the lowest is rendered, and the LLM reads the one it happened not to get',
    ]);
  });

  it('reads the same shape through a different spelling of it', () => {
    // Keys in another order and an example beside the schema are how a
    // contract author writes a 201, not a second shape.
    expect(
      messages(
        operation({
          responses: {
            200: {
              description: 'ok',
              content: { 'application/json': { schema: ref, example: {} } },
            },
            201: {
              description: 'created',
              content: {
                'application/json': { example: { x: 'made' }, schema: ref },
              },
            },
          },
        }),
      ),
    ).toEqual([]);
  });

  it('stops at a schema that contains itself', () => {
    // A YAML anchor aliased beneath itself parses to a node that is its own
    // descendant, with no `$ref` for a guard keyed on one to see. Both walks
    // here and the renderer's own recursed until the stack went.
    const cyclic = operation({});
    const node = { type: 'object', properties: { id: { type: 'integer' } } };
    node.properties.child = { allOf: [{ allOf: [node] }] };
    node.properties.children = { type: 'array', items: node };
    cyclic.paths['/x'].post.requestBody = json(node);
    cyclic.components.schemas.Cyclic = node;
    expect(() => check(cyclic)).not.toThrow();
  });

  it('reports a success body no card can show', () => {
    expect(
      messages(
        operation({
          responses: {
            200: {
              description: 'ok',
              content: { 'text/csv': { schema: { type: 'string' } } },
            },
          },
        }),
      ),
    ).toEqual([
      'a body in text/csv - only a JSON media type is rendered, so this card shows no body at all',
    ]);
  });

  it('checks the schema of a shared response where the card reads it', () => {
    // `successBody` follows a 2xx `$ref` into `components.responses`, so what
    // is inside is read - and checked - like an inline response.
    expect(
      pointers(
        contract({
          components: {
            responses: {
              Made: {
                description: 'created',
                ...json({
                  type: 'object',
                  properties: { a: { type: 'string', format: 'password' } },
                }),
                headers: { Location: { schema: { type: 'string' } } },
              },
            },
          },
          paths: {
            '/a': {
              post: {
                operationId: 'a.create',
                responses: { 201: { $ref: '#/components/responses/Made' } },
              },
            },
          },
        }),
      ),
    ).toEqual([
      '/components/responses/Made/content/application~1json/schema/properties/a/format',
    ]);
  });

  it('reports a label for a value the enum does not carry', () => {
    expect(
      pointers(
        contract({
          components: {
            schemas: {
              E: {
                type: 'integer',
                enum: [1, 2],
                'x-enum-descriptions': { 1: 'one', 2: 'two', 3: 'three' },
              },
            },
          },
        }),
      ),
    ).toEqual(['/components/schemas/E/x-enum-descriptions/3']);
  });
});

// The classification claims a rendering; these read it back off the live
// contract. A claim nothing renders is a claim nobody checked.
describe('what "rendered" means, on the contract itself', () => {
  it('renders a root union as its branches, and a property union as names', () => {
    expect(renderComponentDef('ImageInput')).toContain('One of:');
    expect(renderComponentDef('FacetReportRequest')).toContain(
      '(FacetName | FacetSpec)[]',
    );
  });

  it('renders a map as its value type', () => {
    expect(renderComponentDef('FacetReport')).toContain(
      'facets (Record<string, FacetReportEntry>, required)',
    );
  });

  it('renders an enum on a parameter line and at a component root', () => {
    const card = renderOperation(
      OPERATIONS.find((o) => o.id === 'agendas.events.list'),
      0,
    );
    expect(card).toMatch(/`sort`.*timings\.asc/s);
    expect(renderComponentDef('EventStatus')).toContain('1 = Scheduled');
  });

  it('renders a binary field as the type the client takes', () => {
    const card = renderOperation(
      OPERATIONS.find((o) => o.id === 'agendas.uploads.create'),
      0,
    );
    expect(card).toContain('- file (Blob | File, required)');
  });
});

// A published server resolves `@openagenda/api-spec` on a `^` range: the
// contract an install loads can be newer than the renderer reading it. It says
// so rather than rendering cards that look right.
describe('a contract newer than the server rendering it', () => {
  it('says nothing when there is nothing to say', () => {
    expect(contractWarning([])).toBe('');
    expect(renderSearch(searchOperations('list events'))).not.toContain('⚠');
  });

  it('leads the payload with what to distrust, and how many', () => {
    const findings = Array.from({ length: 7 }, (_, i) => ({
      pointer: `/components/schemas/S${i}`,
      message: 'a thing this version does not read',
    }));
    const warning = contractWarning(findings);
    expect(warning).toContain('7 constructs');
    // The reader is an LLM talking to a server it does not run: it cannot
    // upgrade anything and has no reference to consult - the payload IS its
    // reference. So the warning offers the one check it can actually perform,
    // and no advice it cannot act on.
    expect(warning).toContain('a live response');
    expect(warning).not.toMatch(/upgrade|install|API reference/i);
    expect(warning).toContain(
      '/components/schemas/S0: a thing this version does not read',
    );
    // Five, then a count: the reader must distrust the right cards, not read a
    // catalogue of findings.
    expect(warning).toContain('/components/schemas/S4:');
    expect(warning).not.toContain('/components/schemas/S5:');
    expect(warning).toContain('… and 2 more.');
  });

  it('reads as one construct when there is one', () => {
    const warning = contractWarning([{ pointer: '/x', message: 'unread' }]);
    expect(warning).toContain('1 construct of the loaded API contract');
    expect(warning).not.toContain('… and');
  });
});
