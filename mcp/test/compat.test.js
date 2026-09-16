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

const messages = (contract) => checkContract(contract).map((f) => f.message);
const at = (contract, needle) =>
  checkContract(contract).filter((f) => f.pointer.includes(needle));

// A contract fragment is checked as a whole document, so each fixture below is
// a minimal one: the components and paths it needs, nothing else.
const contract = (parts) => ({ openapi: '3.1.0', ...parts });
const object = { type: 'object', properties: { x: { type: 'string' } } };
const ref = { $ref: '#/components/schemas/Named' };
const operation = (op) =>
  contract({
    components: { schemas: { Named: object } },
    paths: {
      '/x': { post: { operationId: 'x.create', responses: {}, ...op } },
    },
  });

describe('the contract stays inside what search_docs can render', () => {
  it('holds for the contract this server ships with', () => {
    // The failure message is the finding list itself: a pointer per node and
    // what the card would get wrong.
    expect(formatFindings(checkContract(spec))).toBe('');
  });

  // Every construct the contract states and no card shows. A NEW line here is
  // not a bug — it is a decision: somebody deprecated an operation, added a
  // `Location` header, set a field `default`, and nothing on the card says so.
  // Read the rendered card, decide whether it must learn the construct, then
  // update this list.
  it('omits exactly these, and knowingly', () => {
    expect(omissions(spec)).toEqual([
      'a media type `example` — cards carry one runnable example instead',
      'a media type `examples` — cards carry one runnable example instead',
      'a parameter `explode` — wire serialization — the client does it',
      'a parameter `style` — wire serialization — the client does it',
      'a response `headers` — response headers — a `Location` on a creation, a rate-limit budget: not shown',
      'a schema `additionalProperties` — `additionalProperties` next to `properties` — the card lists the declared keys and says nothing of the free-form ones',
      'a schema `default` — a field `default` — not shown',
      'a schema `enum` — an `enum` at a component root — the values are not listed there; the ones worth knowing are spelled out by hand in the description, as `EventStatus` does',
      'a schema `example` — a per-schema example — cards carry one runnable example instead',
      'a schema `examples` — per-schema examples — cards carry one runnable example instead',
      'a schema `format: date-time` — an ISO 8601 string — the type is `string`, and the description says which shape',
      'a schema `format: double` — a number, as the card says',
      'a schema `format: int64` — an integer, as the card says — the client takes a JS number',
      'a schema `format: uri` — a URL string — the type is `string`',
      'a schema `maxLength` — a length constraint — enforced by the API, not shown',
      'a schema `maximum` — a field `maximum` — not shown',
      'a schema `minItems` — an array constraint — enforced by the API, not shown',
      'a schema `minimum` — a field `minimum` — not shown',
      'a schema `pattern` — a string pattern — enforced by the API, not shown',
      'a schema `readOnly` — a server-set field, rendered like any other on a response',
      "a schema `x-additionalPropertiesName` — the generated client's name for a map key",
      'a security scheme `description` — how to obtain the credential — the payload states the Bearer contract once, up front',
      'a security scheme `flows` — the OAuth endpoints — scopes are read off the security requirements, and the flow URLs belong to the authorization server',
      'a security scheme `in` — where a non-Bearer credential goes — such a route is marked as not callable through the client',
      'a security scheme `name` — the header or query name a non-Bearer scheme uses — such a route is marked as not callable through the client',
      'an operation `tags` — grouping metadata — `search_docs` ranks, it does not browse',
      'the document `info` — contract metadata — not part of a card',
      'the document `servers` — the base URLs — the client holds one, cards give the call',
      'the document `tags` — grouping metadata — `search_docs` ranks, it does not browse',
      'the document `x-tagGroups` — reference-site navigation — `search_docs` ranks, it does not browse',
    ]);
  });
});

// Each block below states a claim the renderer makes, and the fixture that
// makes the checker fire on its opposite. A checker that cannot fire guards
// nothing — and one that fires on a shape the renderer DOES handle would be
// worked around instead of read.
describe('a keyword nobody classified fails by default', () => {
  it('reports a JSON Schema keyword the renderer does not read', () => {
    // The whole reason this is a table and not an allowlist of "known" words:
    // these are all valid 2020-12, and every one of them changes what a caller
    // must send while the card says nothing.
    for (const keyword of [
      'anyOf',
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
        components: { schemas: { S: { type: 'object', [keyword]: {} } } },
      });
      expect(messages(shape)).toEqual([
        `\`${keyword}\` — the renderer does not read it; classify it in compat.js before the contract relies on it`,
      ]);
    }
  });

  it('reports an unknown vendor extension rather than waving `x-` through', () => {
    // `x-codeSamples` and `x-synonyms` ARE read; a blanket `x-*` pass would let
    // an extension that changes the generated client through unnoticed.
    expect(
      messages(
        contract({
          components: {
            schemas: { S: { type: 'object', 'x-oa-secret': true } },
          },
        }),
      ),
    ).toEqual([
      '`x-oa-secret` — an extension the renderer does not read; decide whether a card must show it',
    ]);
  });

  it('reports an unclassified key on an operation, a parameter and the document', () => {
    expect(messages({ openapi: '3.1.0', speculative: {} })).toEqual([
      '`speculative` on the document — the renderer does not read it; classify it in compat.js before the contract relies on it',
    ]);
    expect(messages(operation({ 'x-retry': true }))).toEqual([
      '`x-retry` — an extension the renderer does not read; decide whether a card must show it',
    ]);
    expect(
      messages(
        operation({ parameters: [{ name: 'q', in: 'query', speculative: 1 }] }),
      ),
    ).toEqual([
      '`speculative` on a parameter — the renderer does not read it; classify it in compat.js before the contract relies on it',
    ]);
  });
});

describe('a keyword the renderer reads elsewhere, in a position it does not', () => {
  it('reports a `$ref` that does not name a component schema', () => {
    expect(
      messages(
        contract({
          components: {
            schemas: {
              S: {
                type: 'object',
                properties: {
                  a: { $ref: 'shapes.yaml#/Thing' },
                  b: { $ref: '#/$defs/Thing' },
                },
              },
            },
          },
        }),
      ),
    ).toEqual([
      'a `$ref` to shapes.yaml#/Thing — only `#/components/schemas/<Name>` resolves into a named, defined type',
      'a `$ref` to #/$defs/Thing — only `#/components/schemas/<Name>` resolves into a named, defined type',
    ]);
  });

  it('reports keywords sitting beside a `$ref`', () => {
    // 2020-12 allows it (3.0 did not) and it reads as a refinement; the card
    // renders the component alone.
    expect(
      messages(
        contract({
          components: {
            schemas: {
              Named: object,
              S: {
                type: 'object',
                properties: {
                  a: { ...ref, description: 'Refined', default: 2 },
                },
              },
            },
          },
        }),
      ),
    ).toEqual([
      'a `$ref` with `description`, `default` beside it — the card renders the referenced component and drops the rest',
    ]);
  });

  it('reports a multi-type schema, but not a nullable one', () => {
    const multi = (type) =>
      contract({
        components: {
          schemas: { S: { type: 'object', properties: { a: { type } } } },
        },
      });
    expect(messages(multi(['string', 'integer']))).toEqual([
      '`type: [string, integer]` — only the first non-null type is rendered',
    ]);
    // A nullable type IS rendered — `string | null`.
    expect(messages(multi(['string', 'null']))).toEqual([]);
  });

  it('reports a format whose rendering nobody decided', () => {
    expect(
      messages(
        contract({
          components: {
            schemas: {
              S: {
                type: 'object',
                properties: { a: { type: 'string', format: 'password' } },
              },
            },
          },
        }),
      ),
    ).toEqual([
      '`format: password` — decide whether it changes the type the caller must pass, like `binary`, or refines one the card already gives',
    ]);
  });

  it('reports a boolean schema', () => {
    expect(
      messages(
        contract({
          components: {
            schemas: { S: { type: 'object', properties: { a: true } } },
          },
        }),
      ),
    ).toEqual([
      'a boolean schema (`true`/`false` in place of an object) — it renders as `any`',
    ]);
  });
});

describe('the same keyword, handled in one position and lossy in another', () => {
  const inComponentAndProperty = (schema) =>
    contract({
      components: {
        schemas: {
          Named: object,
          AtRoot: schema,
          OnAProperty: { type: 'object', properties: { a: schema } },
        },
      },
    });

  it('accepts a union at a component root and reports one on a property', () => {
    // `renderComponentDef` lists a root union's branches; a property renders as
    // a union of NAMES, so an inline object branch becomes `object`.
    const shape = inComponentAndProperty({ oneOf: [object, { type: 'null' }] });
    expect(at(shape, '/AtRoot')).toEqual([]);
    expect(messages(shape)).toEqual([
      'an inline union with an object branch — the branch renders as `object`, and its fields are lost',
    ]);
  });

  it('accepts an `allOf` at a component root and reports one refining a $ref', () => {
    const shape = inComponentAndProperty({ allOf: [ref, object] });
    expect(at(shape, '/AtRoot')).toEqual([]);
    expect(messages(shape)).toEqual([
      'an `allOf` adding fields to a referenced component — the card names the component, and the added fields are lost',
    ]);
  });

  it('reports a union that also declares properties', () => {
    // No component is shaped this way today, and `objectView` would render the
    // properties and drop the branches without a word.
    expect(
      messages(
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
    ).toEqual([
      'a union that also declares `properties` — only the properties render, and the alternatives vanish',
    ]);
  });

  it('accepts a map of named values and reports a map of inline objects', () => {
    const map = (values) =>
      contract({
        components: {
          schemas: {
            Named: object,
            S: { type: 'object', additionalProperties: values },
          },
        },
      });
    expect(messages(map(ref))).toEqual([]);
    expect(messages(map(object))).toEqual([
      'a map whose values are inline objects — the values render as `object`, and their fields are lost',
    ]);
  });

  it('reports a body wrapped in `allOf` around a component', () => {
    expect(
      messages(
        operation({
          requestBody: {
            content: { 'application/json': { schema: { allOf: [ref] } } },
          },
        }),
      ),
    ).toEqual([
      'a body wrapped in `allOf` around a component — it renders inline, leaving that component defined with no card leading to it',
    ]);
  });

  it('reports `readOnly` a request body reaches, and `writeOnly` a response reaches', () => {
    const field = (flag) => ({
      type: 'object',
      properties: { a: { type: 'string', [flag]: true } },
    });
    const both = contract({
      paths: {
        '/x': {
          post: {
            operationId: 'x.create',
            requestBody: {
              content: { 'application/json': { schema: field('readOnly') } },
            },
            responses: {
              200: {
                description: 'ok',
                content: { 'application/json': { schema: field('writeOnly') } },
              },
            },
          },
        },
      },
    });
    expect(messages(both)).toEqual([
      '`readOnly` on a field a request body reaches — the card offers a field the API will refuse',
      '`writeOnly` on a field a response reaches — the card promises a field that never comes back',
    ]);
  });
});

describe('operations, parameters and responses', () => {
  it('reports an operation the catalogue would skip', () => {
    expect(
      messages(contract({ paths: { '/x': { get: { responses: {} } } } })),
    ).toEqual([
      'an operation with no `operationId` — it is skipped, and the route is absent from the catalogue',
    ]);
  });

  it('reports a path item that carries parameters or hides behind a $ref', () => {
    expect(
      messages(
        contract({
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
      "parameters declared on the path item — only an operation's own `parameters` are read, so these are missing from every card on this path",
      'a `$ref` path item — its operations are not read at all, and vanish from the catalogue',
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
              content: { 'application/json': { schema: object } },
            },
          ],
        }),
      ),
    ).toEqual([
      "a `header` parameter — a card's signature carries `path` and `query` only, so `X-Tenant` is invisible",
      'a parameter carried as a media type instead of a `schema` — it renders as `any`',
    ]);
  });

  it('reports two success codes answering with different shapes', () => {
    const responses = (created) =>
      operation({
        responses: {
          200: {
            description: 'ok',
            content: { 'application/json': { schema: ref } },
          },
          201: {
            description: 'created',
            content: { 'application/json': { schema: created } },
          },
        },
      });
    expect(messages(responses(ref))).toEqual([]);
    expect(messages(responses(object))).toEqual([
      'x.create answers 200 and 201 with different shapes — only the lowest is rendered',
    ]);
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
      'a body in text/csv — only a JSON media type is rendered, so this card shows no response at all',
    ]);
  });

  it('reports multipart `encoding`, which decides how a part is sent', () => {
    expect(
      omissions(
        operation({
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: object,
                encoding: { x: { contentType: 'image/png' } },
              },
            },
          },
        }),
      ),
    ).toContain(
      'a media type `encoding` — `encoding` — the per-part content types and headers of a multipart body are not rendered',
    );
  });
});

describe('the reusable objects, checked where they are defined', () => {
  it('reports a shared parameter once, not once per operation using it', () => {
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
    expect(checkContract(shared)).toEqual([
      {
        pointer: '/components/parameters/Tenant',
        message:
          "a `header` parameter — a card's signature carries `path` and `query` only, so `X-Tenant` is invisible",
      },
    ]);
  });

  it('checks a shared response where it is defined', () => {
    const shared = contract({
      components: {
        responses: {
          Made: {
            description: 'created',
            content: { 'application/json': { schema: object } },
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
    });
    expect(messages(shared)).toEqual([]);
    expect(omissions(shared)).toContain(
      'a response `headers` — response headers — a `Location` on a creation, a rate-limit budget: not shown',
    );
  });

  it('reports a components container the renderer never opens', () => {
    expect(
      messages(contract({ components: { headers: {}, pathItems: {} } })),
    ).toEqual([
      'reusable headers — nothing renders a header, so whatever they describe is invisible',
      'reusable path items — they are reachable only through a `$ref` path item, which the catalogue does not read',
    ]);
  });

  it('reports an unclassified key on a security scheme', () => {
    // Reachability is read off `type` (and `scheme`): a key nobody classified
    // may be the one that decides whether the `oa` client can authenticate.
    expect(
      messages(
        contract({
          components: {
            securitySchemes: {
              k: { type: 'http', scheme: 'bearer', proof: 'dpop' },
            },
          },
        }),
      ),
    ).toEqual([
      '`proof` on a security scheme — the renderer does not read it; classify it in compat.js before the contract relies on it',
    ]);
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

  it('renders a parameter enum, where a component root leaves it to the prose', () => {
    const card = renderOperation(
      OPERATIONS.find((o) => o.id === 'agendas.events.list'),
      0,
    );
    expect(card).toMatch(/`sort`.*timings\.asc/s);
    // `EventStatus` is `enum` at a component root: its values reach the reader
    // through the description, which is why the omission is recorded.
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
    expect(warning).toContain('Upgrade `@openagenda/mcp`');
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
    expect(warning).toContain('1 construct below is not read');
    expect(warning).not.toContain('… and');
  });
});
