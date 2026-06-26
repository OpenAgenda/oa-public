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

// user 50300 public (api) key from fixtures/sql/legacyKeys/50300.json
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
const validateFacetResults = buildValidator('FacetResults');
const validateFacetReport = buildValidator('FacetReport');
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

    it('accepts the maximum limit (100)', async () => {
      const res = await request(app)
        .get('/agendas/2/events?limit=100')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(100);
    });

    // The cap is enforced by rejection, NOT silent clamping: a truncated page
    // looks complete to the caller. Out-of-range and non-integer limits are 400,
    // consistent with the detailed/sort gate.
    it.each([
      ['above the max', '101'],
      ['far above the max (the v2 300)', '300'],
      ['zero', '0'],
      ['negative', '-5'],
      ['non-integer', 'abc'],
      ['fractional', '10.5'],
    ])(
      'rejects a limit %s with a 400 + per-field details',
      async (_label, value) => {
        const res = await request(app)
          .get(`/agendas/2/events?limit=${value}`)
          .set('authorization', `Bearer ${USER_KEY}`);

        expect(res.status).toBe(400);
        assertValid(validateError, res.body, 'Error');
        expect(res.body.error.code).toBe('bad_request');
        expect(res.body.error.details.errors[0].field).toBe('limit');
      },
    );

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

  describe('GET /agendas/:agendaUid/events — detailed view', () => {
    it('returns full Event items when detailed=true', async () => {
      const res = await request(app)
        .get('/agendas/2/events?detailed=true')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const event of res.body.data) {
        assertValid(validateEvent, event, `Event ${event.uid}`);
        // detailed-only fields (the raison d'être of the split) are present.
        expect(event).toHaveProperty('state');
        expect(event).toHaveProperty('createdAt');
        expect(event).toHaveProperty('updatedAt');
      }
    });

    it('treats detailed=false like the default (EventSummary items)', async () => {
      const res = await request(app)
        .get('/agendas/2/events?detailed=false')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      for (const event of res.body.data) {
        assertValid(validateEventSummary, event, `EventSummary ${event.uid}`);
        // detailed-only fields stay out of the summary.
        expect(event).not.toHaveProperty('state');
      }
    });

    // Regression: the summary must carry a real `timezone` (event-search used to
    // strip it alongside `timings`, leaving it always null) and must NOT carry
    // the full `timings` array (now detailed-only). Tie the summary tz to the
    // detailed view so it is proven populated, not merely present.
    it('summary keeps the real timezone but drops the full timings array', async () => {
      const [summary, detailed] = await Promise.all([
        request(app)
          .get('/agendas/2/events?detailed=false')
          .set('authorization', `Bearer ${USER_KEY}`),
        request(app)
          .get('/agendas/2/events?detailed=true')
          .set('authorization', `Bearer ${USER_KEY}`),
      ]);

      expect(summary.status).toBe(200);
      expect(detailed.status).toBe(200);

      const detailedByUid = new Map(detailed.body.data.map((e) => [e.uid, e]));

      let sawPopulatedTimezone = false;
      for (const event of summary.body.data) {
        // the full occurrence array is gone from the light view...
        expect(event).not.toHaveProperty('timings');
        // ...but timezone is present and matches the detailed projection.
        expect(event).toHaveProperty('timezone');
        // When the same event is on the detailed page, its timezone must match;
        // when it isn't, compare against itself (a no-op) so the assertion stays
        // unconditional (jest/no-conditional-expect).
        const counterpart = detailedByUid.get(event.uid);
        expect(event.timezone).toBe(
          counterpart ? counterpart.timezone : event.timezone,
        );
        if (event.timezone != null) sawPopulatedTimezone = true;
      }

      // The fixture's published events carry a timezone, so at least one summary
      // must expose a non-null one (the bug made every one null).
      expect(sawPopulatedTimezone).toBe(true);
    });

    it('rejects a non-boolean detailed with 400 + per-field details', async () => {
      const res = await request(app)
        .get('/agendas/2/events?detailed=yes')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('bad_request');
      expect(res.body.error.details.errors[0].field).toBe('detailed');
    });
  });

  describe('GET /agendas/:agendaUid/events — fields (sparse selection)', () => {
    it('trims each item to the selected fields, always keeping uid', async () => {
      const res = await request(app)
        .get('/agendas/2/events?fields=title,location')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const event of res.body.data) {
        expect(Object.keys(event).sort()).toEqual(['location', 'title', 'uid']);
      }
    });

    it('selecting uid alone returns single-key items', async () => {
      const res = await request(app)
        .get('/agendas/2/events?fields=uid')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      for (const event of res.body.data) {
        expect(Object.keys(event)).toEqual(['uid']);
      }
    });

    it('selects a detailed-only field WITHOUT detailed (full universe)', async () => {
      // `fields` picks the shape over the full Event universe; `detailed` is
      // moot. longDescription is a detailed-only field, yet selectable here.
      const res = await request(app)
        .get('/agendas/2/events?fields=longDescription')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const event of res.body.data) {
        expect(Object.keys(event).sort()).toEqual(['longDescription', 'uid']);
      }
    });

    it('fields wins over detailed when both are given', async () => {
      const res = await request(app)
        .get('/agendas/2/events?detailed=true&fields=uid')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      for (const event of res.body.data) {
        expect(Object.keys(event)).toEqual(['uid']);
      }
    });

    it('derives a timing field from the pushed-down timings (no detailed)', async () => {
      // nextTiming is computed from the full `timings` array; the pushdown must
      // still project `timings` for the parser, while the output stays trimmed.
      const res = await request(app)
        .get('/agendas/2/events?fields=nextTiming')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const event of res.body.data) {
        expect(Object.keys(event).sort()).toEqual(['nextTiming', 'uid']);
      }
    });

    it('dotted paths trim into nested objects', async () => {
      const res = await request(app)
        .get('/agendas/2/events?fields=location.name')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const event of res.body.data) {
        expect(Object.keys(event).sort()).toEqual(['location', 'uid']);
        // location is trimmed to just `name` (or null when the event has none).
        const locationKeys = event.location ? Object.keys(event.location) : [];
        expect(locationKeys.filter((key) => key !== 'name')).toEqual([]);
      }
    });

    it('rejects an unknown field with 400 + per-field details', async () => {
      const res = await request(app)
        .get('/agendas/2/events?fields=title,nope')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.details.errors[0].field).toBe('fields');
    });

    it('rejects an unknown nested leaf under a known keyset with 400', async () => {
      // `location` declares a children keyset, so a bogus sub-key is a 400 —
      // not a silently-dropped best-effort leaf.
      const res = await request(app)
        .get('/agendas/2/events?fields=location.zzz')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.details.errors[0].field).toBe('fields');
    });

    it('pushes the additionalFields bag down (enumerated from the schema)', async () => {
      // Agenda 1 / event 1 carries the `thematique` custom field. Selecting the
      // bare bag enumerates the merged form schema and projects its custom
      // fields, so the value survives the trim.
      const res = await request(app)
        .get('/agendas/1/events?fields=additionalFields')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      const event1 = res.body.data.find((e) => e.uid === 1);
      expect(event1).toBeDefined();
      expect(Object.keys(event1).sort()).toEqual(['additionalFields', 'uid']);
      expect(event1.additionalFields.thematique).toBe(2);
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

  describe('GET /agendas/:agendaUid/events — additionalFields filtering', () => {
    // Network 1 carries form schema 1 (public radio field `thematique`).
    // Agenda 1 published events: uid 1 (thematique=2) and uid 6 (no value).
    const listA1 = (qs = '') =>
      request(app)
        .get(`/agendas/1/events${qs}`)
        .set('authorization', `Bearer ${USER_KEY}`);

    it('narrows to events carrying the additional field value', async () => {
      const baseline = await listA1();
      expect(baseline.status).toBe(200);
      const baselineUids = baseline.body.data.map((e) => e.uid);
      expect(baselineUids).toContain(1);
      expect(baselineUids).toContain(6);

      const filtered = await listA1('?additionalFields[thematique]=2');
      expect(filtered.status).toBe(200);
      const uids = filtered.body.data.map((e) => e.uid);
      expect(uids).toContain(1);
      expect(uids).not.toContain(6);
      expect(filtered.body.data.length).toBeLessThan(baseline.body.data.length);
    });

    it('returns nothing for an additional field value no published event has', async () => {
      const res = await listA1('?additionalFields[thematique]=1');
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

  describe('GET /agendas/:agendaUid/events/ext/:extKey/:extId', () => {
    // Fixture event uid 6 (agenda 1) carries extIds [{ key: 'test', value: '1234' }].
    it('returns 200 with a bare Event resolved by its external id', async () => {
      const res = await request(app)
        .get('/agendas/1/events/ext/test/1234')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      // bare Event, like the by-uid get — not wrapped in { data } or { event }
      expect(res.body.data).toBeUndefined();
      expect(res.body.success).toBeUndefined();
      expect(res.body.extIds).toContainEqual({ key: 'test', value: '1234' });
      assertValid(validateEvent, res.body, 'single Event');
    });

    it('resolves to the exact same event as the by-uid get', async () => {
      const byExt = await request(app)
        .get('/agendas/1/events/ext/test/1234')
        .set('authorization', `Bearer ${USER_KEY}`);

      const byUid = await request(app)
        .get(`/agendas/1/events/${byExt.body.uid}`)
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(byUid.status).toBe(200);
      expect(byExt.body).toEqual(byUid.body);
    });

    it('returns a 404 with the { error } shape for an unknown external id', async () => {
      const res = await request(app)
        .get('/agendas/1/events/ext/test/does-not-exist')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(404);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('not_found');
    });

    it('does not match when the key differs but the value collides', async () => {
      const res = await request(app)
        .get('/agendas/1/events/ext/wrong-key/1234')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('not_found');
    });
  });

  describe('GET /agendas/:agendaUid/events/facets', () => {
    const facetsQ = (qs) =>
      request(app)
        .get(`/agendas/2/events/facets${qs}`)
        .set('authorization', `Bearer ${USER_KEY}`);

    it('returns { value, count } buckets for the requested term facets', async () => {
      const res = await facetsQ('?facets=cities,status');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      // Only requested facets are present.
      expect(Object.keys(res.body.facets).sort()).toEqual(['cities', 'status']);
      // agenda 2 has published events located in Paris -> a city bucket exists.
      expect(res.body.facets.cities.length).toBeGreaterThan(0);
      for (const bucket of res.body.facets.cities) {
        expect(typeof bucket.value).toBe('string');
        expect(typeof bucket.count).toBe('number');
      }
    });

    it('scopes the counts to the filtered set (a no-match filter empties them)', async () => {
      const res = await facetsQ('?facets=cities&keyword=zzzznosuchkeywordzzzz');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.cities).toEqual([]);
    });

    it('returns { agenda, count } buckets for provenance facets', async () => {
      const res = await facetsQ('?facets=originAgendas,sourceAgendas');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(Object.keys(res.body.facets).sort()).toEqual([
        'originAgendas',
        'sourceAgendas',
      ]);
      // Every indexed event carries an origin agenda, so this facet is populated.
      expect(res.body.facets.originAgendas.length).toBeGreaterThan(0);
      for (const bucket of res.body.facets.originAgendas) {
        expect(typeof bucket.agenda.uid).toBe('number');
        expect(typeof bucket.agenda.title).toBe('string');
        expect(typeof bucket.count).toBe('number');
      }
      // Origin agenda refs carry slug (indexed for origins) — proves the
      // AgendaRef fields propagate, not just uid/title.
      expect(
        res.body.facets.originAgendas.some(
          (b) => typeof b.agenda.slug === 'string',
        ),
      ).toBe(true);

      // Source agenda refs are narrower (SourceAgendaRef): uid/title/image,
      // never slug/url — the index only packs those for sources.
      expect(res.body.facets.sourceAgendas.length).toBeGreaterThan(0);
      for (const bucket of res.body.facets.sourceAgendas) {
        expect(typeof bucket.agenda.uid).toBe('number');
        expect(bucket.agenda).not.toHaveProperty('slug');
        expect(bucket.agenda).not.toHaveProperty('url');
      }
    });

    it('returns { location, count } buckets for the locations facet', async () => {
      const res = await facetsQ('?facets=locations');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(Object.keys(res.body.facets)).toEqual(['locations']);
      // agenda 2's published events are attached to locations.
      expect(res.body.facets.locations.length).toBeGreaterThan(0);
      for (const bucket of res.body.facets.locations) {
        // The ref packs only uid+name (location._agg) — never address fields.
        expect(Object.keys(bucket.location).sort()).toEqual(['name', 'uid']);
        expect(Number.isInteger(bucket.location.uid)).toBe(true);
        expect(typeof bucket.count).toBe('number');
      }

      // The uid feeds the locationUid filter: filtering on a bucket's own uid
      // scopes the facet down to exactly that bucket.
      const top = res.body.facets.locations[0];
      const filtered = await facetsQ(
        `?facets=locations&locationUid=${top.location.uid}`,
      );
      expect(filtered.status).toBe(200);
      expect(filtered.body.facets.locations).toEqual([top]);
    });

    it('facetSize caps the bucket count; facetSizes overrides per facet', async () => {
      const base = await facetsQ('?facets=locations');
      const baseLen = base.body.facets.locations.length;
      // The fixture gives agenda 2 events across >1 location, so the cap below
      // is exercised, not vacuous.
      expect(baseLen).toBeGreaterThan(1);

      // Global default caps to 1 bucket, keeping the top (highest-count) one.
      const capped = await facetsQ('?facets=locations&facetSize=1');
      expect(capped.status).toBe(200);
      assertValid(validateFacetResults, capped.body, 'FacetResults');
      expect(capped.body.facets.locations.length).toBe(1);
      expect(capped.body.facets.locations[0]).toEqual(
        base.body.facets.locations[0],
      );

      // Per-facet override beats the global default (precedence).
      const lifted = await facetsQ(
        '?facets=locations&facetSize=1&facetSizes[locations]=250',
      );
      expect(lifted.status).toBe(200);
      expect(lifted.body.facets.locations.length).toBe(baseLen);
    });

    it('is lenient on facetSize: clamps out-of-range, ignores non-numeric', async () => {
      // 0 -> clamped to the minimum (1).
      const zero = await facetsQ('?facets=locations&facetSize=0');
      expect(zero.status).toBe(200);
      expect(zero.body.facets.locations.length).toBe(1);

      // 9999 -> clamped to 250, no 400 and no too_many_buckets failure.
      const huge = await facetsQ('?facets=locations&facetSize=9999');
      expect(huge.status).toBe(200);
      assertValid(validateFacetResults, huge.body, 'FacetResults');

      // Non-numeric -> ignored (native default), still a clean 200.
      const bad = await facetsQ('?facets=locations&facetSize=abc');
      expect(bad.status).toBe(200);
      assertValid(validateFacetResults, bad.body, 'FacetResults');
    });

    it('ignores the size controls for non-bucket-list facets', async () => {
      // viewport is a single object, not a bucket list — facetSize must not
      // alter it (the aggregation ignores size).
      const res = await facetsQ('?facets=viewport&facetSize=1');
      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.viewport).not.toBeNull();
    });

    it('facetSort=alpha orders buckets by their decoded display value', async () => {
      // locations sorts by location.name — proves the sort reads the DECODED
      // bucket, not the internal base64 `_agg` key. >1 bucket (see size test).
      const res = await facetsQ(
        '?facets=locations&facetSort=alpha&facetSize=250',
      );
      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      const names = res.body.facets.locations.map((b) => b.location.name ?? '');
      expect(names.length).toBeGreaterThan(1);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });

    it('facetSorts overrides facetSort per facet', async () => {
      // Global alpha, but locations pinned back to count → identical to the
      // default count-ordered response.
      const base = await facetsQ('?facets=locations&facetSize=250');
      const res = await facetsQ(
        '?facets=locations&facetSort=alpha&facetSorts[locations]=count&facetSize=250',
      );
      expect(res.status).toBe(200);
      expect(res.body.facets.locations).toEqual(base.body.facets.locations);
    });

    it('facetMissing adds a labelled bucket for events lacking the field', async () => {
      // No fixture location sets a district -> every published event is
      // "missing" it, so without missing the facet is empty and with it the
      // whole set lands in one labelled bucket.
      const without = await facetsQ('?facets=districts');
      expect(without.body.facets.districts).toEqual([]);

      const res = await facetsQ(
        '?facets=districts&facetMissing[districts]=__none__',
      );
      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.districts).toHaveLength(1);
      expect(res.body.facets.districts[0].value).toBe('__none__');
      expect(res.body.facets.districts[0].count).toBeGreaterThan(0);
    });

    it('does not apply facetMissing to encoded-key facets (no decode crash)', async () => {
      // locations decodes its bucket key (base64 _agg); a missing bucket there
      // would break the mapper, so facetMissing must be a no-op for it.
      const base = await facetsQ('?facets=locations');
      const res = await facetsQ(
        '?facets=locations&facetMissing[locations]=__none__',
      );
      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.locations).toEqual(base.body.facets.locations);
    });

    it('mixes term and provenance facets in one call', async () => {
      const res = await facetsQ('?facets=cities,originAgendas');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.cities[0]).toHaveProperty('value');
      expect(res.body.facets.originAgendas[0]).toHaveProperty('agenda');
    });

    it('returns a viewport bounding box enclosing located events', async () => {
      const res = await facetsQ('?facets=viewport');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      // agenda 2 has events located in Paris -> a non-null bounding box.
      expect(res.body.facets.viewport).not.toBeNull();
      expect(typeof res.body.facets.viewport.topLeft.latitude).toBe('number');
      expect(typeof res.body.facets.viewport.bottomRight.longitude).toBe(
        'number',
      );
    });

    it('returns a null viewport when the filtered set is empty', async () => {
      // A no-match filter -> 0 events -> no geo bounds -> null.
      const res = await facetsQ(
        '?facets=viewport&keyword=zzzznosuchkeywordzzzz',
      );

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.viewport).toBeNull();
    });

    it('returns geo clusters for the geohash facet', async () => {
      const res = await facetsQ('?facets=geohash&geohashZoom=5');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.geohash.length).toBeGreaterThan(0);
      for (const cluster of res.body.facets.geohash) {
        expect(typeof cluster.value).toBe('string');
        expect(typeof cluster.count).toBe('number');
        expect(typeof cluster.latitude).toBe('number');
        expect(typeof cluster.longitude).toBe('number');
      }
    });

    it('returns a { first, last } timespan over the located events', async () => {
      const res = await facetsQ('?facets=timespan');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      // agenda 2 has published events with timings -> a non-null span.
      expect(res.body.facets.timespan).not.toBeNull();
      const { first, last } = res.body.facets.timespan;
      // RFC 3339 date-times, first no later than last.
      expect(Number.isNaN(Date.parse(first))).toBe(false);
      expect(Number.isNaN(Date.parse(last))).toBe(false);
      expect(Date.parse(first)).toBeLessThanOrEqual(Date.parse(last));
    });

    it('returns a null timespan when the filtered set is empty', async () => {
      const res = await facetsQ(
        '?facets=timespan&keyword=zzzznosuchkeywordzzzz',
      );

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.timespan).toBeNull();
    });

    it('returns a date histogram for the timings facet', async () => {
      const res = await facetsQ('?facets=timings');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.timings.length).toBeGreaterThan(0);
      for (const bucket of res.body.facets.timings) {
        expect(typeof bucket.value).toBe('string');
        expect(typeof bucket.count).toBe('number');
      }
      // Default interval is `day` -> YYYY-MM-DD bucket keys.
      expect(res.body.facets.timings[0].value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('changes the timings bucket granularity with timingsInterval', async () => {
      const res = await facetsQ('?facets=timings&timingsInterval=year');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.timings.length).toBeGreaterThan(0);
      // Yearly buckets are keyed YYYY (proves interval/format track each other).
      for (const bucket of res.body.facets.timings) {
        expect(bucket.value).toMatch(/^\d{4}$/);
      }
    });

    it('returns a dense daily grid for the dateRanges facet', async () => {
      const res = await facetsQ('?facets=dateRanges');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      // Default window is the current calendar month -> one bucket per day,
      // including zero-count days (28..31 buckets).
      const buckets = res.body.facets.dateRanges;
      expect(buckets.length).toBeGreaterThanOrEqual(28);
      expect(buckets.length).toBeLessThanOrEqual(31);
      for (const bucket of buckets) {
        expect(bucket.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof bucket.count).toBe('number');
        expect(bucket.count).toBeGreaterThanOrEqual(0);
      }
    });

    it('windows the dateRanges grid to the month param', async () => {
      // January has 31 days -> exactly 31 daily buckets, all in 2026-01.
      const res = await facetsQ('?facets=dateRanges&month=2026-01');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      const buckets = res.body.facets.dateRanges;
      expect(buckets.length).toBe(31);
      for (const bucket of buckets) {
        expect(bucket.value).toMatch(/^2026-01-\d{2}$/);
      }
    });

    it('counts events within the windowed month', async () => {
      // Discover a month that actually has timings via the timings facet (F),
      // then assert the dateRanges grid for that month counts them (sum >= 1).
      const monthly = await facetsQ('?facets=timings&timingsInterval=month');
      const populated = monthly.body.facets.timings.find((b) => b.count > 0);
      expect(populated).toBeDefined();
      const month = populated.value.slice(0, 7); // YYYY-MM

      const res = await facetsQ(`?facets=dateRanges&month=${month}`);

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      const total = res.body.facets.dateRanges.reduce(
        (sum, b) => sum + b.count,
        0,
      );
      expect(total).toBeGreaterThanOrEqual(1);
    });

    // agenda 1 carries an agenda schema with a public radio field `thematique`
    // (option "2" = Exposition) and a moderator-only text field `note`.
    const facetsA1 = (qs) =>
      request(app)
        .get(`/agendas/1/events/facets${qs}`)
        .set('authorization', `Bearer ${USER_KEY}`);

    it('returns per-field option counts for the additionalFields facet', async () => {
      const res = await facetsA1('?facets=additionalFields');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      const af = res.body.facets.additionalFields;
      // The public optioned field is present; the restricted `note` never is.
      expect(af).toHaveProperty('thematique');
      expect(af).not.toHaveProperty('note');
      const exposition = af.thematique.values.find((v) => v.value === '2');
      expect(exposition).toBeDefined();
      expect(exposition.count).toBeGreaterThanOrEqual(1);
      expect(exposition.label.fr).toBe('Exposition');
    });

    it('honors an explicit additionalFieldsKeys list', async () => {
      const res = await facetsA1(
        '?facets=additionalFields&additionalFieldsKeys=thematique',
      );

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(Object.keys(res.body.facets.additionalFields)).toEqual([
        'thematique',
      ]);
    });

    it('rejects an unknown/non-readable additionalFieldsKeys field with 400', async () => {
      // `note` is moderator-only and not optioned -> reported as unknown (its
      // existence is not revealed) for a public (pk) caller.
      const res = await facetsA1(
        '?facets=additionalFields&additionalFieldsKeys=note',
      );

      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.details.errors[0].field).toBe(
        'additionalFieldsKeys',
      );
    });

    it('returns a (possibly empty) map for the additionalFieldMetrics facet', async () => {
      // This agenda schema has no numeric field -> an empty map, still valid.
      const res = await facetsA1('?facets=additionalFieldMetrics');

      expect(res.status).toBe(200);
      assertValid(validateFacetResults, res.body, 'FacetResults');
      expect(res.body.facets.additionalFieldMetrics).toEqual({});
    });

    it('rejects an unknown facet with 400 + per-field details', async () => {
      const res = await facetsQ('?facets=cities,bogus');

      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('bad_request');
      expect(res.body.error.details.errors[0].field).toBe('facets');
    });

    it('rejects a missing facets param with 400', async () => {
      const res = await facetsQ('');

      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('bad_request');
    });
  });

  describe('POST /agendas/:agendaUid/events/facets (report)', () => {
    const report = (agendaUid, body) =>
      request(app)
        .post(`/agendas/${agendaUid}/events/facets`)
        .set('authorization', `Bearer ${USER_KEY}`)
        .send(body);

    it('aggregates the same type several ways under distinct aliases', async () => {
      const res = await report(2, {
        facets: [
          'cities',
          { name: 'byMonth', type: 'timings', interval: 'month' },
          { name: 'byYear', type: 'timings', interval: 'year' },
        ],
      });

      expect(res.status).toBe(200);
      assertValid(validateFacetReport, res.body, 'FacetReport');
      // Bare string -> alias defaults to the type.
      expect(res.body.facets.cities.type).toBe('cities');
      expect(Array.isArray(res.body.facets.cities.result)).toBe(true);
      // Two timings instances, distinct aliases, both tagged timings.
      expect(res.body.facets.byMonth.type).toBe('timings');
      expect(res.body.facets.byYear.type).toBe('timings');
      // Month buckets are keyed YYYY-MM, year buckets YYYY -> different grids.
      const monthKeys = res.body.facets.byMonth.result.map((b) => b.value);
      const yearKeys = res.body.facets.byYear.result.map((b) => b.value);
      expect(monthKeys.some((k) => /^\d{4}-\d{2}$/.test(k))).toBe(true);
      expect(yearKeys.every((k) => /^\d{4}$/.test(k))).toBe(true);
    });

    it('applies per-instance size and scopes to body filters', async () => {
      const res = await report(2, {
        filters: { keyword: ['zzzznosuchkeywordzzzz'] },
        facets: [{ name: 'c', type: 'cities', size: 3 }],
      });
      expect(res.status).toBe(200);
      assertValid(validateFacetReport, res.body, 'FacetReport');
      // No event matches the filter -> the facet is empty over the scoped set.
      expect(res.body.facets.c.result).toEqual([]);
    });

    it('honors the access-gated additionalFields family under an alias', async () => {
      const res = await report(1, {
        facets: [
          { name: 'themes', type: 'additionalFields', fields: ['thematique'] },
        ],
      });
      expect(res.status).toBe(200);
      assertValid(validateFacetReport, res.body, 'FacetReport');
      expect(res.body.facets.themes.type).toBe('additionalFields');
      expect(res.body.facets.themes.result).toHaveProperty('thematique');
      expect(res.body.facets.themes.result).not.toHaveProperty('note');
    });

    it('rejects duplicate aliases with 400', async () => {
      const res = await report(2, {
        facets: [
          { name: 'x', type: 'cities' },
          { name: 'x', type: 'keywords' },
        ],
      });
      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.details.errors[0].field).toBe('facets[1].name');
    });

    it('rejects an unknown facet type with 400', async () => {
      const res = await report(2, { facets: ['bogus'] });
      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.details.errors[0].field).toBe('facets[0]');
    });

    it('rejects an empty/missing facets array with 400', async () => {
      const res = await report(2, { facets: [] });
      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.details.errors[0].field).toBe('facets');
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
      // store is the only source of truth. verify → agenda owner rebuilt from
      // referenceId.
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
