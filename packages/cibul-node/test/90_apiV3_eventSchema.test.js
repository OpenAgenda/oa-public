import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import request from 'supertest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import Services from '../services/init.js';
import Core from '../core/index.js';
import instanciateApiV3 from '../api-v3/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'tracker',
  'accessTokens',
  'files',
  'bull',
  'events',
  'agendas',
  'agendaEvents',
  'geocoder',
  'agendaLocations',
  'formSchemas',
  'custom',
  'eventSearch',
  'members',
  'networks',
  'users',
];

// janine's public (pk) key — the schema is the same whatever the caller: the
// per-field `read` levels gate event VALUES, not the form descriptors.
const USER_PK = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

// Agenda 17026855 (id 218) uses form_schema 2 = fixtures/form-schemas/1.json:
// additional fields incl. `custom_description` (read: ['moderator']) and
// `intermunicipal_interest` (public), plus a location legacy tagSet.
const AGENDA_UID = 17026855;

const specPath = fileURLToPath(
  import.meta.resolve('@openagenda/api-spec/openapi.yaml'),
);
const spec = parse(readFileSync(specPath, 'utf8'));

function buildValidator(ref) {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  ajv.addSchema(spec, 'openapi');
  return ajv.getSchema(`openapi#/components/schemas/${ref}`);
}

const validateEventFormSchema = buildValidator('EventFormSchema');
const validateError = buildValidator('Error');

function assertValid(validate, body, label) {
  const ok = validate(body);
  if (!ok) {
    throw new Error(
      `${label} failed schema:\n${JSON.stringify(validate.errors, null, 2)}\n`
        + `body:\n${JSON.stringify(body, null, 2)}`,
    );
  }
  expect(ok).toBe(true);
}

describe('90 - api-v3 - functional (server): GET /agendas/:agendaUid/events/schema', () => {
  let core;
  let app;

  const config = testConfig.extendWith({
    cachePrefix: 'apiV3_eventSchema_test',
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['014.sql.js', '90_apiV3_agendas.private.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });
    core = Core(services, config);

    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();

    app = instanciateApiV3(core, { useRouter: false });
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  const get = (agendaUid = AGENDA_UID) =>
    request(app)
      .get(`/agendas/${agendaUid}/events/schema`)
      .set('authorization', `Bearer ${USER_PK}`);

  it('serves the raw merged schema, contract-valid', async () => {
    const res = await get();

    expect(res.status).toBe(200);
    assertValid(validateEventFormSchema, res.body, 'EventFormSchema');

    const byName = new Map(res.body.fields.map((f) => [f.field, f]));

    // Native event fields are present (merged in by includeEvent).
    expect(byName.has('title')).toBe(true);
    expect(byName.has('timings')).toBe(true);

    // The agenda's own additional field, with its options and origin marker.
    const additional = byName.get('intermunicipal_interest');
    expect(additional?.schemaId).toBe(2);
    expect(Array.isArray(additional?.options)).toBe(true);
    expect(additional?.options[0]).toHaveProperty('value');

    // The location field carries its sub-schema (incl. the legacy tagSet
    // converted to schema vocabulary) — served raw, untouched.
    expect(byName.get('location')).toHaveProperty('schema');
  });

  it('filters read-gated descriptors by the caller access', async () => {
    const res = await get();
    const names = res.body.fields.map((f) => f.field);

    // `custom_description` is `read: ['moderator']` in the merged schema. Its
    // descriptor (label, options, role map) is internal — the organiser's `read`
    // array IS the declaration that it is not public — so a `pk` caller
    // (resolving to `public`) must NOT receive it, matching the facets endpoint
    // and the legacy `/:agendaSlug/settings/schema` façade.
    expect(names).not.toContain('custom_description');
    // Public descriptors stay: this is a gate, not an emptying.
    expect(names).toContain('title');
    expect(names).toContain('intermunicipal_interest');
  });

  it('is 404 on an unknown and on a private agenda', async () => {
    for (const uid of [424242, 990001]) {
      const res = await get(uid);
      expect(res.status).toBe(404);
      assertValid(validateError, res.body, `Error (${uid})`);
      expect(res.body.error.code).toBe('not_found');
    }
  });

  it('answers 401 without credentials', async () => {
    const res = await request(app).get(`/agendas/${AGENDA_UID}/events/schema`);
    expect(res.status).toBe(401);
  });
});
