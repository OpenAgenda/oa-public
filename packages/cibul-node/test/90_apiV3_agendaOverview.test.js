import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import request from 'supertest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import Services from '../services/init.js';
import Core from '../core/index.js';
import instanciateApiV3 from '../api-v3/index.js';
import mapAgendaOverview from '../api-v3/lib/mapAgendaOverview.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'bull',
  'files',
  'events',
  'agendas',
  'agendaEvents',
  'agendaLocations',
  'formSchemas',
  'custom',
  'eventSearch',
  'agendaSearch',
  'members',
  'networks',
  'users',
  'accessTokens',
];

// user 50300 public (api) key — resolves to the 'public' read access, so the
// gated `events.all` scope must never appear over HTTP with it.
const USER_KEY = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

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

const validateOverview = buildValidator('AgendaOverview');
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

describe('90 - api-v3 - functional (server): agenda overview', () => {
  let core;
  let app;

  const config = testConfig.extendWith({ cachePrefix: 'apiV3_overview_test' });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['001.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });
    core = Core(services, config);

    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({ index: 'test' })
      .catch(() => null);

    await core.agendas(2).events.search.rebuild();
    await core.agendas(1).events.search.rebuild();

    app = instanciateApiV3(core, { useRouter: false });
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('GET /agendas/:agendaUid/overview', () => {
    const get = (uid) =>
      request(app)
        .get(`/agendas/${uid}/overview`)
        .set('authorization', `Bearer ${USER_KEY}`);

    it('returns 200 with a contract-valid AgendaOverview (published scope)', async () => {
      const res = await get(2);

      expect(res.status).toBe(200);
      assertValid(validateOverview, res.body, 'AgendaOverview');

      // The public-visible scope is always present and fully shaped.
      expect(res.body.events.published).toBeDefined();
      expect(typeof res.body.events.published.total).toBe('number');
      expect(res.body.events.published.timeline).toEqual(
        expect.objectContaining({
          current: expect.any(Number),
          passed: expect.any(Number),
          upcoming: expect.any(Number),
        }),
      );
      expect(typeof res.body.events.published.locations).toBe('number');
      expect(typeof res.body.events.published.creators).toBe('number');
      expect(Array.isArray(res.body.events.published.keywords)).toBe(true);

      // recentlyAdded is hoisted to the root with its interpretable window.
      expect(typeof res.body.recentlyAdded.window).toBe('number');
      expect(res.body.recentlyAdded.bySource).toBeDefined();
    });

    it('omits the gated events.all scope for a public caller', async () => {
      const res = await get(2);
      expect(res.status).toBe(200);
      expect(res.body.events).not.toHaveProperty('all');
    });

    it('returns a 404 with the { error } shape for an unknown agenda', async () => {
      const res = await get(99999999);
      expect(res.status).toBe(404);
      assertValid(validateError, res.body, 'Error');
    });
  });

  // The gated `all` scope cannot be reached with the public fixture key, so we
  // exercise the privileged branch at the core level (still end-to-end against
  // ES) and validate the mapped contract.
  describe('events.all scope (privileged access)', () => {
    it('materialises events.all for an administrator and validates', async () => {
      const overview = await core
        .agendas(2)
        .overview({ access: 'administrator' });

      const body = mapAgendaOverview(overview);
      assertValid(validateOverview, body, 'AgendaOverview (admin)');

      expect(body.events.all).toBeDefined();
      expect(body.events.all.byState).toBeDefined();
      // The all scope omits the published-only distinct counts.
      expect(body.events.all).not.toHaveProperty('locations');
      expect(body.events.all).not.toHaveProperty('creators');
    });

    it('omits events.all for a non-privileged role (e.g. contributor)', async () => {
      const overview = await core
        .agendas(2)
        .overview({ access: 'contributor' });

      expect(overview.all).toBeNull();
      const body = mapAgendaOverview(overview);
      expect(body.events).not.toHaveProperty('all');
    });
  });
});
