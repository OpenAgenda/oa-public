import * as keysMw from '@openagenda/keys/middleware.js';
import Services from '../services/init.js';
import { backfillFromKeyTable } from '../services/keys/lib/apiKeyMirror.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

// D2: every write to the legacy `key` table is mirrored (hashed) into the
// better-auth `apikey` store, and a one-shot backfill reconciles existing keys.
// The read path is still legacy — these tests assert the mirror is complete and
// concordant by verifying through the plugin's `verifyApiKey`, the exact path
// the D3 bascule will switch to. A legacy plaintext that verifies here proves
// the embedded integrations will keep working once the read path flips.

// Drive a keys HTTP middleware handler in isolation. cbify (in the keys
// middleware) resolves by calling next(err?) — a truthy arg means error.
function runMiddleware(handler, req) {
  return new Promise((resolve, reject) => {
    handler(req, {}, (err) => (err ? reject(err) : resolve(req.result)));
  });
}

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'accessTokens',
  'bull',
  'files',
  'users',
  'keys',
  'members',
  'networks',
  'mails',
  'unsubscriptions',
  'genUrl',
  'errors',
  'security',
];

describe('90 - api-key dual-write + backfill (D2)', () => {
  let services;
  let knex;

  const config = testConfig.extendWith({ cachePrefix: 'apikey_d2_test' });
  const { schemas } = config;

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: [],
    });
  });

  beforeAll(async () => {
    services = await Services(config, { enabled });
    knex = services.knex;
  });

  afterAll(() => services.shutdown({ clear: true }));

  const verify = (key) => services.auth.api.verifyApiKey({ body: { key } });

  describe('dual-write through the keys service', () => {
    // `key.identifier` is a numeric uid (bigInteger column); referenceId is its
    // string form, agenda keys prefixed with `agenda:`. Legacy keys carry no
    // per-resource scopes (permissions: null) — the tier is the `oaKind` marker.
    it('mirrors a userPublic key as an ungated pk (referenceId = uid)', async () => {
      const created = await services
        .keys({ type: 'userPublic', identifier: 90001 })
        .create();

      const verified = await verify(created.key);

      expect(verified.valid).toBe(true);
      expect(verified.key.referenceId).toBe('90001');
      expect(verified.key.permissions).toBeNull();
      expect(verified.key.metadata.oaKind).toBe('pk');
    });

    it('mirrors a userPrivate key as an ungated sk', async () => {
      const created = await services
        .keys({ type: 'userPrivate', identifier: 90001 })
        .create();

      const verified = await verify(created.key);

      expect(verified.valid).toBe(true);
      expect(verified.key.referenceId).toBe('90001');
      expect(verified.key.permissions).toBeNull();
      expect(verified.key.metadata.oaKind).toBe('sk');
    });

    it('mirrors an agendaFullRead key under referenceId agenda:<uid>', async () => {
      const created = await services
        .keys({ type: 'agendaFullRead', identifier: 90002 })
        .create();

      const verified = await verify(created.key);

      expect(verified.valid).toBe(true);
      expect(verified.key.referenceId).toBe('agenda:90002');
      expect(verified.key.permissions).toBeNull();
      expect(verified.key.metadata.oaKind).toBe('agenda');
    });

    it('replaces the mirror on regeneration (old plaintext stops verifying)', async () => {
      const keysSvc = services.keys({
        type: 'userPublic',
        identifier: 90003,
      });
      const first = await keysSvc.create();
      expect((await verify(first.key)).valid).toBe(true);

      const second = await keysSvc.create();

      expect((await verify(second.key)).valid).toBe(true);
      expect((await verify(first.key)).valid).toBe(false);

      const rows = await knex(schemas.apiKey)
        .where({ reference_id: '90003' })
        .count('* as n')
        .first();
      expect(Number(rows.n)).toBe(1);
    });

    it('deletes the mirror on remove', async () => {
      const created = await services
        .keys({ type: 'userPublic', identifier: 90004 })
        .create();
      expect((await verify(created.key)).valid).toBe(true);

      await services.keys({ type: 'userPublic', identifier: 90004 }).remove();

      expect((await verify(created.key)).valid).toBe(false);
    });
  });

  describe('dual-write through the keys HTTP middleware (settings UI path)', () => {
    // The agenda-settings key UI goes through @openagenda/keys/middleware.js,
    // which holds its own raw service instance — it never sees the cibul-node
    // service object. Mirroring lives in a service-level hook precisely so this
    // path is covered too. Guards against the revocation gap a wrapper-only
    // approach would leave (UI delete not propagated to `apikey`).
    it('mirrors then revokes an agenda key created/removed via the middleware', async () => {
      const createReq = {
        identifiers: { type: 'agendaFullRead', identifier: 90020 },
        body: {},
      };
      await runMiddleware(keysMw.create(), createReq);
      const { key } = createReq.result;

      const created = await verify(key);
      expect(created.valid).toBe(true);
      expect(created.key.referenceId).toBe('agenda:90020');
      expect(created.key.metadata.oaKind).toBe('agenda');

      const removeReq = {
        identifiers: { type: 'agendaFullRead', identifier: 90020 },
      };
      await runMiddleware(keysMw.remove(), removeReq);

      expect((await verify(key)).valid).toBe(false);
    });
  });

  describe('backfill from the legacy key table', () => {
    const pub = 'd2bfpub00000000000000000000000aa';
    const sec = 'd2bfsec00000000000000000000000bb';
    const agd = 'd2bfagd00000000000000000000000cc';

    beforeAll(async () => {
      await knex(schemas.key).insert([
        {
          type: 'userPublic',
          identifier: 90010,
          key: pub,
          label: 'bf pub',
          created_at: new Date(),
        },
        {
          type: 'userPrivate',
          identifier: 90010,
          key: sec,
          created_at: new Date(),
        },
        {
          type: 'agendaFullRead',
          identifier: 90011,
          key: agd,
          created_at: new Date(),
        },
      ]);

      await backfillFromKeyTable({ knex, schemas });
    });

    it('hashes existing user keys so the plaintext keeps verifying', async () => {
      const pubVerified = await verify(pub);
      expect(pubVerified.valid).toBe(true);
      expect(pubVerified.key.referenceId).toBe('90010');
      expect(pubVerified.key.permissions).toBeNull();
      expect(pubVerified.key.metadata.oaKind).toBe('pk');

      const secVerified = await verify(sec);
      expect(secVerified.valid).toBe(true);
      expect(secVerified.key.metadata.oaKind).toBe('sk');
    });

    it('hashes existing agenda keys under referenceId agenda:<uid>', async () => {
      const verified = await verify(agd);
      expect(verified.valid).toBe(true);
      expect(verified.key.referenceId).toBe('agenda:90011');
      expect(verified.key.metadata.oaKind).toBe('agenda');
    });

    it('keeps the full legacy plaintext in `start` (mirror keys stay visible)', async () => {
      const row = await knex(schemas.apiKey)
        .where({ reference_id: 'agenda:90011' })
        .first('start', 'metadata');
      expect(row.start).toBe(agd);
      expect(JSON.parse(row.metadata).source).toBe('mirror');
    });

    it('is idempotent (re-running leaves one mirror row per owner/kind)', async () => {
      await backfillFromKeyTable({ knex, schemas });

      const userRows = await knex(schemas.apiKey)
        .where({ reference_id: '90010' })
        .count('* as n')
        .first();
      expect(Number(userRows.n)).toBe(2); // one pk + one sk

      const agendaRows = await knex(schemas.apiKey)
        .where({ reference_id: 'agenda:90011' })
        .count('* as n')
        .first();
      expect(Number(agendaRows.n)).toBe(1);

      expect((await verify(pub)).valid).toBe(true);
    });
  });
});
