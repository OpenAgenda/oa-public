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
  'agendaSearch',
  'members',
  'networks',
  'users',
];

// janine's keys from fixtures/sql/apiKeys/01-{pk,sk}.json (014.sql.js)
const USER_SK = 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM';
const USER_PK = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

// janine (uid 1) memberships in 014.sql.js: administrator on 93399464,
// 17026855, 48353388 and 55268170, + contributor on the PRIVATE agenda
// 990001 (90_apiV3_me.extra.sql.js) = 5 listable rows, + 1 STALE row on the
// nonexistent agenda 990404 (dropped from `data`, but still counted by the
// members listing's `total` until the cleanup task would catch up).
const PRIVATE_UID = 990001;
const PRIVATE_NETWORK = { uid: 990002, title: 'Réseau du gating test' };
const STALE_UID = 990404;
const ADMIN_UIDS = [93399464, 17026855, 48353388, 55268170];
const TOTAL_MEMBERSHIPS = 5;
const TOTAL_MEMBER_ROWS = 6;

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
const validateMeAgendaItemDetailed = buildValidator('MeAgendaItemDetailed');
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

    expect(res.body.data.length).toBe(TOTAL_MEMBERSHIPS);
    expect(res.body.pagination.total).toBe(TOTAL_MEMBER_ROWS);
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

    // The stale membership (deleted agenda, surviving member row) is dropped:
    // no 500 from the enrichment, no contract-violating bare item.
    expect(byUid.has(STALE_UID)).toBe(false);
  });

  it('paginates with the opaque after cursor', async () => {
    // Reference order: the whole list in one page; pages must reproduce the
    // same sequence.
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

  it('returns detailed items when detailed=true — private SQL-fallback included', async () => {
    const res = await get('?detailed=true&limit=100');
    expect(res.status).toBe(200);
    assertValid(validateMeAgendaList, res.body, 'MeAgendaList (detailed)');

    for (const agenda of res.body.data) {
      assertValid(
        validateMeAgendaItemDetailed,
        agenda,
        `MeAgendaItemDetailed ${agenda.uid}`,
      );
      expect(agenda).toHaveProperty('createdAt');
      expect(agenda).toHaveProperty('network');
      expect(agenda).toHaveProperty('locationSet');
    }

    // The set agenda resolves its locationSet ref; the private one resolves
    // its detailed tier through the SQL fallback — including the network ref,
    // whose uid is excluded from the service's default list projection.
    const byUid = new Map(res.body.data.map((a) => [a.uid, a]));
    expect(byUid.get(55268170)?.locationSet).toEqual({
      uid: 1,
      title: 'Un jeu de lieux',
    });
    expect(byUid.get(PRIVATE_UID)?.private).toBe(true);
    expect(byUid.get(PRIVATE_UID)?.createdAt).toBeTruthy();
    expect(byUid.get(PRIVATE_UID)?.network).toEqual(PRIVATE_NETWORK);
  });

  describe('fields (sparse selection)', () => {
    it('trims each item to the selection, always keeping uid', async () => {
      const res = await get('?fields=title,role');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(TOTAL_MEMBERSHIPS);
      for (const agenda of res.body.data) {
        expect(Object.keys(agenda).sort()).toEqual(['role', 'title', 'uid']);
      }
    });

    it('selects a ref WITHOUT detailed, resolving it for the private fallback', async () => {
      // `network` is a detailed-only ref; selecting it makes the SQL fallback
      // resolve it (the pushdown keeps it when asked), and the private agenda's
      // value still comes through.
      const res = await get('?fields=network&limit=100');
      expect(res.status).toBe(200);
      const byUid = new Map(res.body.data.map((a) => [a.uid, a]));
      for (const agenda of res.body.data) {
        expect(Object.keys(agenda).sort()).toEqual(['network', 'uid']);
      }
      expect(byUid.get(PRIVATE_UID)?.network).toEqual(PRIVATE_NETWORK);
    });

    it('omitting a ref still yields correct summary data (refs skipped)', async () => {
      // `network`/`locationSet` are NOT selected: the route skips their SQL ref
      // resolution entirely, yet the selected fields stay correct — incl. the
      // private agenda resolved through the SQL fallback.
      const res = await get('?fields=title&limit=100');
      expect(res.status).toBe(200);
      const byUid = new Map(res.body.data.map((a) => [a.uid, a]));
      for (const agenda of res.body.data) {
        expect(Object.keys(agenda).sort()).toEqual(['title', 'uid']);
      }
      expect(byUid.get(PRIVATE_UID)?.title).toBe('Agenda privé (gating test)');
    });

    it('rejects an unknown field with 400 + per-field details', async () => {
      const res = await get('?fields=title,nope');
      expect(res.status).toBe(400);
      expect(res.body.error.details.errors[0].field).toBe('fields');
    });
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

  it('returns a 400 for a decodable cursor with a non-integer position', async () => {
    // Well-formed cursor envelope, wrong payload type: must fail the contract
    // 400 at the decode gate, not reach the members keyset. encodeCursor
    // performs no validation (the gate lives in decode), so this stays a
    // forgery — and it tracks the wire format if it ever evolves.
    const forged = encodeCursor({ after: ['abc'] });
    const res = await get(`?after=${forged}`);
    expect(res.status).toBe(400);
    assertValid(validateError, res.body, 'Error (forged cursor)');
  });
});
