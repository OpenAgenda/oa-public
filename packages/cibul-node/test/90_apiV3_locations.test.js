import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import request from 'supertest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import Services from '../services/init.js';
import Core from '../core/index.js';
import instanciateApiV3 from '../api-v3/index.js';
import { encodeCursor } from '../api-v3/lib/cursor.js';
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

// janine's public (pk) key from fixtures/sql/apiKeys/01-pk.json (014.sql.js)
const USER_KEY = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

// Agenda with its own location pool (fixtures 014: 6 locations + 3 extra rows
// from 90_apiV3_locations.extra.sql.js, 2 of which are deleted/merged).
const AGENDA_UID = 17026855;
// Agendas sharing location set 1 (locations 5, 8, 9 of fixtures 014).
const SET_AGENDA_UID = 55268170;

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

const validateLocationList = buildValidator('LocationList');
const validateLocationSummary = buildValidator('LocationSummary');
const validateLocation = buildValidator('Location');
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

describe('90 - api-v3 - functional (server): locations read endpoints', () => {
  let core;
  let app;

  const config = testConfig.extendWith({ cachePrefix: 'apiV3_locations_test' });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: [
        '014.sql.js',
        '90_apiV3_agendas.private.sql.js',
        '90_apiV3_locations.extra.sql.js',
      ],
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

  const get = (path, qs = '') =>
    request(app).get(`${path}${qs}`).set('authorization', `Bearer ${USER_KEY}`);

  describe('GET /agendas/:agendaUid/locations', () => {
    it('returns 200 with a contract-valid { data, pagination } envelope', async () => {
      const res = await get(`/agendas/${AGENDA_UID}/locations`);

      expect(res.status).toBe(200);
      assertValid(validateLocationList, res.body, 'LocationList');
      // 6 fixture locations + the imported extra one; the deleted and merged
      // rows never surface.
      expect(res.body.pagination.total).toBe(7);
      expect(res.body.data.length).toBe(7);
      const uids = res.body.data.map((l) => l.uid);
      expect(uids).toContain(99000003);
      expect(uids).not.toContain(99000001);
      expect(uids).not.toContain(99000002);
    });

    it('items are LocationSummary by default, most recently created first', async () => {
      const res = await get(`/agendas/${AGENDA_UID}/locations`);
      expect(res.status).toBe(200);
      for (const location of res.body.data) {
        assertValid(
          validateLocationSummary,
          location,
          `LocationSummary ${location.uid}`,
        );
        expect(location).not.toHaveProperty('slug');
        expect(location).not.toHaveProperty('extIds');
      }
      // createdAt.desc: the 2026 extra row comes before the 2017 fixtures.
      expect(res.body.data[0].uid).toBe(99000003);
    });

    it('supports cursor pagination via the opaque after token', async () => {
      const first = await get(`/agendas/${AGENDA_UID}/locations`, '?limit=2');
      expect(first.status).toBe(200);
      expect(first.body.data.length).toBe(2);
      expect(first.body.pagination.limit).toBe(2);
      expect(typeof first.body.pagination.after).toBe('string');

      const second = await get(
        `/agendas/${AGENDA_UID}/locations`,
        `?limit=2&after=${encodeURIComponent(first.body.pagination.after)}`,
      );
      expect(second.status).toBe(200);
      assertValid(validateLocationList, second.body, 'LocationList (page 2)');
      const firstUids = first.body.data.map((l) => l.uid);
      for (const location of second.body.data) {
        expect(firstUids).not.toContain(location.uid);
      }
    });

    it('answers after: null on the last page', async () => {
      const res = await get(`/agendas/${AGENDA_UID}/locations`, '?limit=100');
      expect(res.status).toBe(200);
      expect(res.body.pagination.after).toBeNull();
    });

    it('returns full Location items when detailed=true', async () => {
      const res = await get(
        `/agendas/${AGENDA_UID}/locations`,
        '?detailed=true',
      );
      expect(res.status).toBe(200);
      assertValid(validateLocationList, res.body, 'LocationList (detailed)');
      for (const location of res.body.data) {
        assertValid(validateLocation, location, `Location ${location.uid}`);
        expect(location).toHaveProperty('slug');
        expect(location).toHaveProperty('additionalFields');
      }
    });

    it('search is a text search — an all-digits term is NOT a uid filter', async () => {
      const text = await get(
        `/agendas/${AGENDA_UID}/locations`,
        '?search=Boutique',
      );
      expect(text.status).toBe(200);
      expect(text.body.data.map((l) => l.uid)).toEqual([123]);

      // v2 silently rewrites an all-digits search into a uid filter; v3 does
      // not (it has a dedicated uid filter), so this matches nothing.
      const digits = await get(
        `/agendas/${AGENDA_UID}/locations`,
        '?search=18927679',
      );
      expect(digits.status).toBe(200);
      expect(digits.body.data).toEqual([]);
    });

    it('filters by uid', async () => {
      const res = await get(
        `/agendas/${AGENDA_UID}/locations`,
        '?uid=123&uid=18927679',
      );
      expect(res.status).toBe(200);
      expect(res.body.data.map((l) => l.uid).sort()).toEqual([123, 18927679]);
    });

    it('filters by external id', async () => {
      const res = await get(
        `/agendas/${AGENDA_UID}/locations`,
        '?extId[key]=import&extId[value]=loc-42',
      );
      expect(res.status).toBe(200);
      expect(res.body.data.map((l) => l.uid)).toEqual([99000003]);
    });

    it('filters by bounding box', async () => {
      // A box around Paris catches the fixture locations there but not the
      // Château des Lèbres (Ardèche, 44.39/4.11).
      const res = await get(
        `/agendas/${AGENDA_UID}/locations`,
        '?bbox=2.2,48.8,2.5,48.9',
      );
      expect(res.status).toBe(200);
      const uids = res.body.data.map((l) => l.uid);
      expect(uids).toContain(123);
      expect(uids).not.toContain(18927679);
    });

    it('filters by creation date', async () => {
      const res = await get(
        `/agendas/${AGENDA_UID}/locations`,
        '?createdAt[gte]=2026-01-01T00:00:00Z',
      );
      expect(res.status).toBe(200);
      expect(res.body.data.map((l) => l.uid)).toEqual([99000003]);
    });

    it('lists the whole shared set for a location-set agenda', async () => {
      const res = await get(
        `/agendas/${SET_AGENDA_UID}/locations`,
        '?detailed=true',
      );
      expect(res.status).toBe(200);
      assertValid(validateLocationList, res.body, 'LocationList (set)');
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      for (const location of res.body.data) {
        expect(location.setUid).toBe(1);
      }
    });

    it('returns a 400 with the { error } shape for malformed parameters', async () => {
      // A decodable cursor with a non-integer keyset position: must fail at
      // the decode gate (the service's nav validator throws non-Error shapes
      // the error handler can't map into the contract envelope).
      // encodeCursor performs no validation (the gate lives in decode), so
      // this stays a forgery — and it tracks the wire format if it evolves.
      const forgedCursor = encodeCursor({ after: ['abc'] });

      for (const qs of [
        '?bbox=1,2,3',
        '?after=not-a-valid-cursor!!',
        `?after=${forgedCursor}`,
        '?detailed=maybe',
        '?createdAt[eq]=2026-01-01',
        '?uid=',
        '?uid=%20',
      ]) {
        const res = await get(`/agendas/${AGENDA_UID}/locations`, qs);
        expect(res.status).toBe(400);
        assertValid(validateError, res.body, `Error (${qs})`);
        expect(res.body.error.code).toBe('bad_request');
      }
    });

    it('is 404 on a private agenda and 401 without credentials', async () => {
      const priv = await get(`/agendas/${PRIVATE_UID}/locations`);
      expect(priv.status).toBe(404);
      assertValid(validateError, priv.body, 'Error (private)');

      const anonymous = await request(app).get(
        `/agendas/${AGENDA_UID}/locations`,
      );
      expect(anonymous.status).toBe(401);
    });
  });

  describe('GET /agendas/:agendaUid/locations/:locationUid', () => {
    it('returns the full contract-valid Location', async () => {
      const res = await get(`/agendas/${AGENDA_UID}/locations/18927679`);

      expect(res.status).toBe(200);
      assertValid(validateLocation, res.body, 'Location');
      expect(res.body.uid).toBe(18927679);
      expect(res.body.name).toBe('Château des Lebres');
      expect(res.body.verified).toBe(true);
      expect(res.body.additionalFields).toHaveProperty('tags');
      // legacy/internal keys never leak
      expect(res.body).not.toHaveProperty('state');
      expect(res.body).not.toHaveProperty('extId');
      expect(res.body).not.toHaveProperty('deleted');
    });

    it('is a plain 404 for an unknown or foreign location uid', async () => {
      for (const uid of [424242, 34566591]) {
        const res = await get(`/agendas/${AGENDA_UID}/locations/${uid}`);
        expect(res.status).toBe(404);
        assertValid(validateError, res.body, 'Error (unknown)');
        expect(res.body.error.code).toBe('not_found');
      }
    });

    it('is a plain 404 for a deleted location', async () => {
      const res = await get(`/agendas/${AGENDA_UID}/locations/99000001`);
      expect(res.status).toBe(404);
      assertValid(validateError, res.body, 'Error (deleted)');
      expect(res.body.error.code).toBe('not_found');
    });

    it('answers 404 with the merged code and mergedIn for a merged location', async () => {
      const res = await get(`/agendas/${AGENDA_UID}/locations/99000002`);
      expect(res.status).toBe(404);
      assertValid(validateError, res.body, 'Error (merged)');
      expect(res.body.error.code).toBe('merged');
      expect(res.body.error.details.mergedIn).toBe(123);
    });

    it('returns a 400 for a non-numeric location uid', async () => {
      const res = await get(`/agendas/${AGENDA_UID}/locations/not-a-uid`);
      expect(res.status).toBe(400);
      assertValid(validateError, res.body, 'Error (bad uid)');
    });
  });
});
