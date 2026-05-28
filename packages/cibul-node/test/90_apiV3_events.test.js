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

  describe('GET /agendas/:agendaUid/events — filtering', () => {
    // agenda 2 published events: uids 2, 7, 8 (event 1 is state 0). Events 7/8
    // are at location 1 (Paris), event 2 has no resolvable coordinates. All
    // timings are in 2019 (past). updatedAt: event 2 = 2022, events 7/8 = now.
    const listQ = (qs = '') =>
      request(app)
        .get(`/agendas/2/events${qs}`)
        .set('authorization', `Bearer ${USER_KEY}`);

    it('rejects an unknown enum value with 400 + per-field details', async () => {
      const res = await listQ('?status=99');
      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('bad_request');
      expect(res.body.error.details).toBeDefined();
      expect(res.body.error.details.errors[0].field).toBe('status');
    });

    it('rejects an unknown sort value with 400', async () => {
      const res = await listQ('?sort=title.asc');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('bad_request');
    });

    it('ignores unknown parameters (forward-compatible)', async () => {
      const baseline = await listQ();
      const res = await listQ('?totallyUnknownParam=42');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(baseline.body.data.length);
    });

    it('ignores visibility/moderation params — state cannot widen results', async () => {
      const baseline = await listQ();
      // event 1 sits in agenda 2 with state 0 (unpublished). If `state` were
      // honored, ?state=0 would surface it; it must stay published-only.
      const res = await listQ('?state=0');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(baseline.body.data.length);
      expect(res.body.data.some((e) => e.uid === 1)).toBe(false);
    });

    it('status filter returns exactly the events with that status', async () => {
      const all = await listQ();
      const target = all.body.data[0].status;
      const expected = all.body.data.filter((e) => e.status === target).length;

      const res = await listQ(`?status=${target}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(expected);
      for (const event of res.body.data) {
        expect(event.status).toBe(target);
      }
    });

    it('featured filter partitions the result set without overlap', async () => {
      const truthy = await listQ('?featured=true');
      const falsy = await listQ('?featured=false');
      expect(truthy.status).toBe(200);
      expect(falsy.status).toBe(200);

      for (const event of truthy.body.data) expect(event.featured).toBe(true);
      for (const event of falsy.body.data) expect(event.featured).toBe(false);

      const truthyUids = truthy.body.data.map((e) => e.uid);
      const falsyUids = falsy.body.data.map((e) => e.uid);
      expect(truthyUids.filter((uid) => falsyUids.includes(uid))).toHaveLength(
        0,
      );
    });

    it('relative=upcoming excludes past events; relative=passed keeps them', async () => {
      const baseline = await listQ();
      const upcoming = await listQ('?relative=upcoming');
      const passed = await listQ('?relative=passed');

      expect(upcoming.status).toBe(200);
      expect(upcoming.body.data).toHaveLength(0);
      expect(passed.body.data.length).toBe(baseline.body.data.length);
    });

    it('timings[gte] in the far future returns nothing', async () => {
      const res = await listQ(
        `?timings[gte]=${encodeURIComponent('2999-01-01T00:00:00Z')}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('updatedAt range filters and partitions the result set', async () => {
      const baseline = await listQ();

      const future = await listQ(
        `?updatedAt[gte]=${encodeURIComponent('2999-01-01T00:00:00Z')}`,
      );
      expect(future.body.data).toHaveLength(0);

      const epoch = await listQ(
        `?updatedAt[gte]=${encodeURIComponent('1970-01-01T00:00:00Z')}`,
      );
      expect(epoch.body.data.length).toBe(baseline.body.data.length);

      // 2024 splits event 2 (updated 2022) from events 7/8 (updated now).
      const recent = await listQ(
        `?updatedAt[gte]=${encodeURIComponent('2024-01-01T00:00:00Z')}`,
      );
      expect(recent.body.data.length).toBeGreaterThan(0);
      expect(recent.body.data.length).toBeLessThan(baseline.body.data.length);
    });

    it('bbox keeps only events located inside the box', async () => {
      const paris = await listQ('?bbox=2.2,48.8,2.5,48.95');
      expect(paris.status).toBe(200);
      expect(paris.body.data.length).toBeGreaterThan(0);
      for (const event of paris.body.data) {
        expect(event.location).not.toBeNull();
        expect(event.location.latitude).toBeGreaterThanOrEqual(48.8);
        expect(event.location.latitude).toBeLessThanOrEqual(48.95);
        expect(event.location.longitude).toBeGreaterThanOrEqual(2.2);
        expect(event.location.longitude).toBeLessThanOrEqual(2.5);
      }

      const elsewhere = await listQ('?bbox=100,10,101,11');
      expect(elsewhere.body.data).toHaveLength(0);
    });

    it('near + radius keeps nearby events; a far point returns nothing', async () => {
      const near = await listQ('?near=48.8676,2.3503&radius=5000');
      expect(near.status).toBe(200);
      expect(near.body.data.length).toBeGreaterThan(0);

      const far = await listQ('?near=0,0&radius=50000');
      expect(far.body.data).toHaveLength(0);
    });

    it('rejects near without radius with 400', async () => {
      const res = await listQ('?near=48.8676,2.3503');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('bad_request');
    });

    it('paginates with a filter — cursor carries position, filter is resent', async () => {
      const filter = `?timings[lte]=${encodeURIComponent('2030-01-01T00:00:00Z')}`;

      const first = await listQ(`${filter}&limit=1`);
      expect(first.status).toBe(200);
      expect(first.body.data).toHaveLength(1);
      expect(typeof first.body.pagination.after).toBe('string');

      const second = await listQ(
        `${filter}&limit=1&after=${encodeURIComponent(
          first.body.pagination.after,
        )}`,
      );
      expect(second.status).toBe(200);
      assertValid(
        validateEventList,
        second.body,
        'EventList (page 2, filtered)',
      );
      expect(second.body.data).toHaveLength(1);
      expect(second.body.data[0].uid).not.toBe(first.body.data[0].uid);
    });
  });

  describe('GET /agendas/:agendaUid/events — custom field filtering', () => {
    // Network 1 carries form schema 1 (public radio field `thematique`).
    // Agenda 1 published events: uid 1 (thematique=2) and uid 6 (no custom).
    const listA1 = (qs = '') =>
      request(app)
        .get(`/agendas/1/events${qs}`)
        .set('authorization', `Bearer ${USER_KEY}`);

    it('narrows to events carrying the custom field value', async () => {
      const baseline = await listA1();
      expect(baseline.status).toBe(200);
      const baselineUids = baseline.body.data.map((e) => e.uid);
      expect(baselineUids).toContain(1);
      expect(baselineUids).toContain(6);

      const filtered = await listA1('?custom[thematique]=2');
      expect(filtered.status).toBe(200);
      const uids = filtered.body.data.map((e) => e.uid);
      expect(uids).toContain(1);
      expect(uids).not.toContain(6);
      expect(filtered.body.data.length).toBeLessThan(baseline.body.data.length);
    });

    it('returns nothing for a custom value no published event has', async () => {
      const res = await listA1('?custom[thematique]=1');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
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

  describe('authentication', () => {
    it('returns 401 with the { error } envelope when no credentials are given', async () => {
      const res = await request(app).get('/agendas/2/events');

      expect(res.status).toBe(401);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('unauthorized');
    });

    it('returns 401 with the { error } envelope for an invalid key', async () => {
      const res = await request(app)
        .get('/agendas/2/events')
        .set('authorization', 'Bearer oa_does_not_exist');

      expect(res.status).toBe(401);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('unauthorized');
    });

    it('resolves an agenda key through verifyApiKey (apikey store is the only source)', async () => {
      // Mint a native agenda key via the @openagenda/auth façade — the apikey
      // store is the single source of truth since D5a (legacy `key`/`api_key_set`
      // drift fallback removed). verify → agenda owner rebuilt from referenceId.
      const { key: keyValue } = await core.services.auth.createAgendaKey(2, {});

      const res = await request(app)
        .get('/agendas/2/events')
        .set('authorization', `Bearer ${keyValue}`);

      expect(res.status).toBe(200);
      assertValid(validateEventList, res.body, 'EventList');
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
