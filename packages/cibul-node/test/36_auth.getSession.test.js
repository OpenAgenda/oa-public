// Integration test for the native /api/auth/get-session payload.
// cibul-node no longer wires `resolveSessionExtras`, so BA's vanilla
// get-session is in effect: a successful signin followed by GET
// /api/auth/get-session returns the native better-auth user (OA columns
// declared as core/additional fields with `returned: true`), NOT the legacy
// OA-enriched projection (no `thumbnail`/`fullName`/`hasLocalAccount`/… keys).
import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import generalFront from '../general/front.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import buildApp from './helpers/buildApp.js';
import flushRateLimit from './helpers/rateLimit.js';

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'accessTokens',
  'files',
  'bull',
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
  'trackers',
  'sessions',
  'abilities',
  'invitations',
  'mails',
  'unsubscriptions',
  'activities',
  'inboxes',
  'behavioralEmails',
  'genUrl',
  'errors',
  'security',
];

describe('36 - /api/auth/get-session native payload', () => {
  let core;
  let services;
  let usersSvc;
  let app;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: [],
    });
  });

  beforeAll(async () => {
    services = await Services(testConfig, { enabled });
    core = Core(services, testConfig);
    usersSvc = services.users;
    app = buildApp(services, testConfig, {
      extend: (a) => {
        generalFront(a);
      },
    });
  });

  beforeEach(() => flushRateLimit(services.redis));

  afterAll(() => core.services.shutdown({ clear: true }));

  it('returns the native better-auth user after a successful signin', async () => {
    const email = 'getsession-native@oa.test';
    const password = 'plainPwd-36';
    const created = await usersSvc.create(
      {
        fullName: 'GetSession Native',
        email,
        password,
        isActivated: true,
        culture: 'fr',
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    const res = await agent.get('/api/auth/get-session');
    expect(res.status).toBe(200);
    expect(res.body.session).toBeTruthy();

    const { user } = res.body;

    // Native BA fields. The numeric id / uid come straight from the DB row
    // (MySQL BIGINT); BA surfaces them via core + additional field mappings.
    expect(String(user.id)).toBe(String(created.id));
    expect(String(user.uid)).toBe(String(created.uid));
    expect(user).toMatchObject({
      email,
      // `name` is BA's mapping of the OA `full_name` column.
      name: 'GetSession Native',
      culture: 'fr',
      // Freshly created OA user — the native `is_new` column is still set.
      isNew: true,
      isBlacklisted: false,
      transverseApiAccess: false,
    });
    // `image` is the raw stored path (null here, no avatar uploaded) — the key
    // is present and not an absolute thumbnail URL.
    expect(Object.prototype.hasOwnProperty.call(user, 'image')).toBe(true);
    expect(user.image == null).toBe(true);

    // The OA enrichment is gone: none of the legacy projected-only members are
    // emitted anymore (consumers that need them read the users API instead).
    expect(user.thumbnail).toBeUndefined();
    expect(user.fullName).toBeUndefined();
    expect(user.isActivated).toBeUndefined();
    expect(user.hasLocalAccount).toBeUndefined();
    expect(user.hasSocialAccount).toBeUndefined();
    expect(res.body.lang).toBeUndefined();
  });
});
