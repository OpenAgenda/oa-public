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
  'agendaSearch',
  'members',
  'networks',
  'users',
];

// janine's keys from fixtures/sql/apiKeys/01-{pk,sk}.json (014.sql.js)
const USER_SK = 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM';
const USER_PK = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

// janine (uid 1) memberships in 014.sql.js: administrator on 93399464,
// 48353388, 55268170 and TWICE on 17026855 (two reviewer rows — kept as-is:
// like v2, /me lists membership rows without deduplicating), + contributor on
// the PRIVATE agenda 990001 (90_apiV3_me.extra.sql.js). 6 rows total.
const PRIVATE_UID = 990001;
const ADMIN_UIDS = [93399464, 17026855, 48353388, 55268170];
const TOTAL_MEMBERSHIPS = 6;

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

const validateMeAgendaList = buildValidator('MeAgendaList');
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

describe('90 - api-v3 - functional (server): /me/agendas', () => {
  let core;
  let app;

  const config = testConfig.extendWith({ cachePrefix: 'apiV3_me_test' });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: [
        '014.sql.js',
        '90_apiV3_agendas.private.sql.js',
        '90_apiV3_me.extra.sql.js',
      ],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });
    core = Core(services, config);

    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();

    await core.services.agendaSearch
      .getConfig?.()
      ?.client?.indices?.delete({ index: 'test' })
      .catch(() => null);

    // Index the public fixture agendas so the enrichment's ES tier sees them;
    // the private one stays out of the index by construction (its enrichment
    // exercises the SQL fallback).
    await core.agendas.rebuildIndex();

    app = instanciateApiV3(core, { useRouter: false });
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  const get = (qs = '', key = USER_SK) =>
    request(app).get(`/me/agendas${qs}`).set('authorization', `Bearer ${key}`);

  it('lists the memberships with role and private flag, contract-valid', async () => {
    const res = await get();

    expect(res.status).toBe(200);
    assertValid(validateMeAgendaList, res.body, 'MeAgendaList');

    expect(res.body.pagination.total).toBe(TOTAL_MEMBERSHIPS);
    const byUid = new Map(res.body.data.map((a) => [a.uid, a]));

    for (const uid of ADMIN_UIDS) {
      expect(byUid.get(uid)?.role).toBe('administrator');
      expect(byUid.get(uid)?.private).toBe(false);
    }

    // The private agenda IS listed (membership), flagged, with its SQL-side
    // summary fields resolved despite being absent from the search index.
    const priv = byUid.get(PRIVATE_UID);
    expect(priv?.role).toBe('contributor');
    expect(priv?.private).toBe(true);
    expect(priv?.title).toBe('Agenda privé (gating test)');
  });

  it('paginates with the opaque after cursor', async () => {
    // Reference order: the whole list in one page. A membership row can
    // duplicate an agenda uid (17026855), so pages are compared against the
    // reference SEQUENCE, not as uid sets.
    const all = await get('?limit=100');
    expect(all.status).toBe(200);
    expect(all.body.data.length).toBe(TOTAL_MEMBERSHIPS);
    expect(all.body.pagination.after).toBeNull();
    const reference = all.body.data.map((a) => a.uid);

    const first = await get('?limit=2');
    expect(first.status).toBe(200);
    expect(first.body.data.length).toBe(2);
    expect(typeof first.body.pagination.after).toBe('string');
    expect(first.body.data.map((a) => a.uid)).toEqual(reference.slice(0, 2));

    const second = await get(
      `?limit=2&after=${encodeURIComponent(first.body.pagination.after)}`,
    );
    expect(second.status).toBe(200);
    assertValid(validateMeAgendaList, second.body, 'MeAgendaList (page 2)');
    expect(second.body.data.map((a) => a.uid)).toEqual(reference.slice(2, 4));
  });

  it('answers 401 to a publishable key (no user identity) and to anonymous', async () => {
    const pk = await get('', USER_PK);
    expect(pk.status).toBe(401);
    assertValid(validateError, pk.body, 'Error (pk)');

    const anonymous = await request(app).get('/me/agendas');
    expect(anonymous.status).toBe(401);
  });

  it('returns a 400 for a malformed after cursor', async () => {
    const res = await get('?after=not-a-cursor!!');
    expect(res.status).toBe(400);
    assertValid(validateError, res.body, 'Error (cursor)');
  });
});
