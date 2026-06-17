import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import request from 'supertest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import Services from '../services/init.js';
import Core from '../core/index.js';
import instanciateApiV3 from '../api-v3/index.js';
import { decodeCursor } from '../api-v3/lib/cursor.js';
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

// user 50300 public (api) key from fixtures/sql/legacyKeys/50300.json
const USER_KEY = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

// A private (but indexed:1) agenda seeded by 90_apiV3_agendas.private.sql.js —
// must be invisible on every v3 read route.
const PRIVATE_UID = 990001;

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

const validateAgendaList = buildValidator('AgendaList');
const validateAgendaSummary = buildValidator('AgendaSummary');
const validateAgendaDetailed = buildValidator('AgendaDetailed');
const validateAgenda = buildValidator('Agenda');
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

describe('90 - api-v3 - functional (server): agendas read endpoints', () => {
  let core;
  let app;

  const config = testConfig.extendWith({ cachePrefix: 'apiV3_agendas_test' });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['001.sql.js', '90_apiV3_agendas.private.sql.js'],
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

    // Index agendas 1 & 2 (fixtures/sql/agendas/0{1,2}.json) into the agenda ES
    // index so the list endpoint (core.agendas.search) can see them.
    await core.agendas.rebuildIndex();

    app = instanciateApiV3(core, { useRouter: false });
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('GET /agendas', () => {
    const listQ = (qs = '') =>
      request(app)
        .get(`/agendas${qs}`)
        .set('authorization', `Bearer ${USER_KEY}`);

    it('returns 200 with a contract-valid { data, pagination } envelope', async () => {
      const res = await listQ();

      expect(res.status).toBe(200);
      assertValid(validateAgendaList, res.body, 'AgendaList');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toHaveProperty('after');
      expect(res.body.pagination).toHaveProperty('limit');
      // Both fixture agendas (uid 1 & 2) are indexed and public.
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      // …but the private agenda never surfaces (the reindex source skips
      // private agendas, so it is not in the ES index in the first place).
      expect(res.body.data.map((a) => a.uid)).not.toContain(PRIVATE_UID);
    });

    it('items are AgendaSummary by default (no detailed fields)', async () => {
      const res = await listQ();
      expect(res.status).toBe(200);
      for (const agenda of res.body.data) {
        assertValid(
          validateAgendaSummary,
          agenda,
          `AgendaSummary ${agenda.uid}`,
        );
        expect(agenda).not.toHaveProperty('createdAt');
        expect(agenda).not.toHaveProperty('network');
        expect(agenda).not.toHaveProperty('url');
      }
    });

    it('applies the limit and exposes it in pagination', async () => {
      const res = await listQ('?limit=1');
      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(1);
      expect(res.body.data.length).toBe(1);
      expect(typeof res.body.pagination.after).toBe('string');
    });

    it('supports cursor pagination via the opaque after token', async () => {
      const first = await listQ('?limit=1');
      expect(first.status).toBe(200);
      expect(first.body.data.length).toBe(1);
      expect(typeof first.body.pagination.after).toBe('string');

      const second = await listQ(
        `?limit=1&after=${encodeURIComponent(first.body.pagination.after)}`,
      );
      expect(second.status).toBe(200);
      assertValid(validateAgendaList, second.body, 'AgendaList (page 2)');
      expect(second.body.data.length).toBe(1);
      // The uid tiebreaker in the search sort makes the order deterministic
      // even though both fixture agendas share createdAt.
      expect(second.body.data[0].uid).not.toBe(first.body.data[0].uid);
    });

    it('returns a 400 with the { error } shape for a malformed after cursor', async () => {
      const res = await listQ('?after=not-a-valid-cursor!!');
      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('bad_request');
    });

    describe('sort', () => {
      // The sort that produced a page is pinned into the opaque cursor; decode
      // it to assert the ordering applied — robust to the 2-agenda fixture set,
      // which is too small to assert a relevance ranking by row order.
      const cursorSort = (after) => decodeCursor(after)?.sort ?? null;

      it('orders the browse list by createdAt.desc by default', async () => {
        const res = await listQ('?limit=1');
        expect(res.status).toBe(200);
        expect(cursorSort(res.body.pagination.after)).toBe('createdAt.desc');
      });

      it('ranks ?search results by relevance (no createdAt sort pinned)', async () => {
        // The bug: the list forced createdAt.desc unconditionally, burying text
        // matches. Relevance leaves the sort unset (core ranks by _score), so
        // the cursor carries no pinned sort.
        const res = await listQ('?search=commune&limit=1');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(cursorSort(res.body.pagination.after)).toBeNull();
      });

      it('accepts an explicit ?sort=createdAt.desc even when searching', async () => {
        const res = await listQ('?search=commune&sort=createdAt.desc&limit=1');
        expect(res.status).toBe(200);
        expect(cursorSort(res.body.pagination.after)).toBe('createdAt.desc');
      });

      it('accepts the opt-in ?sort=recentlyAddedEvents.desc', async () => {
        const res = await listQ('?sort=recentlyAddedEvents.desc&limit=1');
        expect(res.status).toBe(200);
        expect(cursorSort(res.body.pagination.after)).toBe(
          'recentlyAddedEvents.desc',
        );
      });

      it('pins the cursor sort across a page sequence', async () => {
        const first = await listQ('?sort=recentlyAddedEvents.desc&limit=1');
        expect(first.status).toBe(200);
        const next = await listQ(
          `?limit=1&after=${encodeURIComponent(first.body.pagination.after)}`,
        );
        expect(next.status).toBe(200);
        // The cursor's sort wins over the (absent) ?sort on the follow-up.
        expect(cursorSort(next.body.pagination.after)).toBe(
          'recentlyAddedEvents.desc',
        );
      });

      it('rejects an out-of-allowlist ?sort with 400 + per-field details', async () => {
        const res = await listQ('?sort=relevance');
        expect(res.status).toBe(400);
        assertValid(validateError, res.body, 'Error');
        expect(res.body.error.code).toBe('bad_request');
        expect(res.body.error.details.errors[0].field).toBe('sort');
      });
    });

    describe('detailed view', () => {
      it('returns AgendaDetailed items when detailed=true', async () => {
        const res = await listQ('?detailed=true');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        for (const agenda of res.body.data) {
          assertValid(
            validateAgendaDetailed,
            agenda,
            `AgendaDetailed ${agenda.uid}`,
          );
          // detailed projection adds these…
          expect(agenda).toHaveProperty('createdAt');
          expect(agenda).toHaveProperty('network');
          expect(agenda).toHaveProperty('locationSet');
          // …but is deliberately narrower than the single-get Agenda.
          expect(agenda).not.toHaveProperty('url');
          expect(agenda).not.toHaveProperty('updatedAt');
          expect(agenda).not.toHaveProperty('private');
        }
      });

      it('treats detailed=false like the default (AgendaSummary items)', async () => {
        const res = await listQ('?detailed=false');
        expect(res.status).toBe(200);
        for (const agenda of res.body.data) {
          assertValid(
            validateAgendaSummary,
            agenda,
            `AgendaSummary ${agenda.uid}`,
          );
          expect(agenda).not.toHaveProperty('createdAt');
        }
      });

      it('rejects a non-boolean detailed with 400 + per-field details', async () => {
        const res = await listQ('?detailed=yes');
        expect(res.status).toBe(400);
        assertValid(validateError, res.body, 'Error');
        expect(res.body.error.code).toBe('bad_request');
        expect(res.body.error.details.errors[0].field).toBe('detailed');
      });
    });

    describe('filtering', () => {
      it('official=true returns none (neither fixture agenda is official); official=false returns both', async () => {
        const officialOnly = await listQ('?official=true');
        expect(officialOnly.status).toBe(200);
        expect(officialOnly.body.data).toHaveLength(0);

        const nonOfficial = await listQ('?official=false');
        expect(nonOfficial.status).toBe(200);
        expect(nonOfficial.body.data.length).toBeGreaterThanOrEqual(2);
        for (const agenda of nonOfficial.body.data) {
          expect(agenda.official).toBe(false);
        }
      });

      it('uid filter restricts to the requested agendas', async () => {
        const res = await listQ('?uid=1');
        expect(res.status).toBe(200);
        expect(res.body.data.map((a) => a.uid)).toEqual([1]);
      });

      it('slug filter restricts to the matching agenda', async () => {
        const res = await listQ('?slug=un-agenda-thematique');
        expect(res.status).toBe(200);
        expect(res.body.data.map((a) => a.uid)).toEqual([2]);
      });

      it('search narrows on the agenda title', async () => {
        const res = await listQ('?search=commune');
        expect(res.status).toBe(200);
        // "Une commune de Fraaance" is agenda 1.
        expect(res.body.data.map((a) => a.uid)).toContain(1);
        expect(res.body.data.map((a) => a.uid)).not.toContain(2);
      });

      it('rejects a non-integer uid with 400 + per-field details', async () => {
        const res = await listQ('?uid=nope');
        expect(res.status).toBe(400);
        assertValid(validateError, res.body, 'Error');
        expect(res.body.error.details.errors[0].field).toBe('uid');
      });

      it('ignores unknown parameters (forward-compatible)', async () => {
        const baseline = await listQ();
        const res = await listQ('?totallyUnknownParam=42');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(baseline.body.data.length);
      });
    });
  });

  describe('GET /agendas/:agendaUid', () => {
    it('returns 200 with a bare contract-valid full Agenda', async () => {
      const res = await request(app)
        .get('/agendas/1')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      // bare Agenda, not wrapped in { data } or { success }
      expect(res.body.data).toBeUndefined();
      expect(res.body.success).toBeUndefined();
      assertValid(validateAgenda, res.body, 'single Agenda');
      expect(res.body.uid).toBe(1);
      expect(res.body.slug).toBe('une-commune-de-fraaance');
      // full-only fields are present (the reason get is richer than the list).
      expect(res.body).toHaveProperty('url');
      expect(res.body).toHaveProperty('updatedAt');
      expect(res.body).toHaveProperty('private');
      expect(res.body).toHaveProperty('indexed');
    });

    it('resolves the network ref for an agenda that has one', async () => {
      const res = await request(app)
        .get('/agendas/1')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(200);
      // agenda 1 has network_uid 1 in the fixtures.
      expect(res.body.network).not.toBeNull();
      expect(res.body.network.uid).toBe(1);
    });

    it('returns a 404 with the { error } shape for an unknown agenda', async () => {
      const res = await request(app)
        .get('/agendas/999999999')
        .set('authorization', `Bearer ${USER_KEY}`);

      expect(res.status).toBe(404);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('not_found');
    });
  });

  // A private agenda must be invisible on EVERY :agendaUid route, not just the
  // single get. loadAgenda is the single chokepoint, so the events sub-routes
  // (which read req.agenda directly) are gated too — a private agenda's
  // published events must not be reachable. 404 (not 403) doesn't confirm it
  // exists.
  describe('private agenda gating', () => {
    const authed = (path) =>
      request(app).get(path).set('authorization', `Bearer ${USER_KEY}`);

    it('404s the single get for a private agenda', async () => {
      const res = await authed(`/agendas/${PRIVATE_UID}`);
      expect(res.status).toBe(404);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('not_found');
    });

    it('404s the events list of a private agenda (the real gap)', async () => {
      const res = await authed(`/agendas/${PRIVATE_UID}/events`);
      expect(res.status).toBe(404);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('not_found');
    });

    it('404s the events facets of a private agenda', async () => {
      const res = await authed(`/agendas/${PRIVATE_UID}/events/facets`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('not_found');
    });

    it('404s a single event of a private agenda', async () => {
      const res = await authed(`/agendas/${PRIVATE_UID}/events/1`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('not_found');
    });
  });

  describe('authentication', () => {
    it('returns 401 when no credentials are given', async () => {
      const res = await request(app).get('/agendas');
      expect(res.status).toBe(401);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('unauthorized');
    });

    it('returns 401 for an invalid key', async () => {
      const res = await request(app)
        .get('/agendas')
        .set('authorization', 'Bearer oa_does_not_exist');
      expect(res.status).toBe(401);
      assertValid(validateError, res.body, 'Error');
      expect(res.body.error.code).toBe('unauthorized');
    });
  });
});
