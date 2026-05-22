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
  'members',
  'networks',
  'users',
  'keys',
  'accessTokens',
];

// user 50300 public (api) key from fixtures/sql/apiKeySets/50300.json
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

const validateEvent = buildValidator('Event');
const validateEventSummary = buildValidator('EventSummary');
const validateEventList = buildValidator('EventList');
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

describe('90 - api-v3 - functional (server): events read endpoints', () => {
  let core;
  let app;

  const config = testConfig.extendWith({ cachePrefix: 'apiV3_events_test' });

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

    // useRouter: false -> express app whose `.core`/`.services` back the reused
    // v2 middleware (they read req.app.services / req.app.core).
    app = instanciateApiV3(core, { useRouter: false });
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('GET /agendas/:agendaUid/events', () => {
    it('returns 200 with a contract-valid { data, pagination } envelope', async () => {
      const res = await request(app)
        .get('/agendas/2/events')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      assertValid(validateEventList, res.body, 'EventList');

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination).toHaveProperty('after');
      expect(res.body.pagination).toHaveProperty('limit');
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('applies the limit and exposes it in pagination', async () => {
      const res = await request(app)
        .get('/agendas/2/events?limit=1')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(1);
      expect(res.body.data.length).toBeLessThanOrEqual(1);
    });

    it('each event in data validates against the EventSummary schema', async () => {
      const res = await request(app)
        .get('/agendas/2/events')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      for (const event of res.body.data) {
        assertValid(validateEventSummary, event, `EventSummary ${event.uid}`);
      }
    });

    it('supports cursor pagination via the opaque after token', async () => {
      // agenda 2 has more than one published event, so the first limit=1 page
      // returns a non-null cursor.
      const first = await request(app)
        .get('/agendas/2/events?limit=1')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(first.status).toBe(200);
      expect(first.body.data.length).toBe(1);
      expect(typeof first.body.pagination.after).toBe('string');

      const second = await request(app)
        .get(
          `/agendas/2/events?limit=1&after=${encodeURIComponent(
            first.body.pagination.after,
          )}`,
        )
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(second.status).toBe(200);
      assertValid(validateEventList, second.body, 'EventList (page 2)');
      expect(second.body.data.length).toBe(1);
      expect(second.body.data[0].uid).not.toBe(first.body.data[0].uid);
    });

    it('returns a 400 with the { error } shape for a malformed after cursor', async () => {
      const res = await request(app)
        .get('/agendas/2/events?after=not-a-valid-cursor!!')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('bad_request');
    });
  });

  describe('GET /agendas/:agendaUid/events/:eventUid', () => {
    it('returns 200 with a bare contract-valid Event', async () => {
      const list = await request(app)
        .get('/agendas/2/events')
        .set('authorization', `Bearer ${USER_KEY}`);
      const [{ uid }] = list.body.data;

      const res = await request(app)
        .get(`/agendas/2/events/${uid}`)
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      // bare Event, not wrapped in { data } or { success, event }
      expect(res.body.data).toBeUndefined();
      expect(res.body.success).toBeUndefined();
      expect(res.body.uid).toBe(uid);
      assertValid(validateEvent, res.body, 'single Event');
    });

    it('returns a 404 with the { error } shape for an unknown event', async () => {
      const res = await request(app)
        .get('/agendas/2/events/999999999')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(404);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('not_found');
    });
  });
});
