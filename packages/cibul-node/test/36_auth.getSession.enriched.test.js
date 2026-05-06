// Integration test for the enriched /api/auth/get-session payload.
// The customSession plugin is wired in cibul-node's auth service via
// `resolveSessionExtras`, so a successful signin followed by GET
// /api/auth/get-session must return the OA-projected user (with thumbnail,
// fullName, …) instead of the vanilla BA user row.
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

describe('36 - /api/auth/get-session enriched payload', () => {
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

  it('returns the OA-projected user payload after a successful signin', async () => {
    const email = 'getsession-enriched@oa.test';
    const password = 'plainPwd-36';
    const created = await usersSvc.create(
      {
        fullName: 'GetSession Enriched',
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
    // BA's customSession returns the projected OA user. The numeric id /
    // uid come straight from the DB row (MySQL BIGINT) — the projection is
    // pure (see packages/auth/src/projectUser.js) and does not stringify.
    expect(String(res.body.user.id)).toBe(String(created.id));
    expect(String(res.body.user.uid)).toBe(String(created.uid));
    expect(res.body.user).toMatchObject({
      email,
      name: 'GetSession Enriched',
      fullName: 'GetSession Enriched',
      isActivated: true,
      isBlacklisted: false,
      culture: 'fr',
    });
    // thumbnail is computed by cibul-node's resolveSessionExtras (null when
    // no image, otherwise prefixed with imageBucketPath) — the key must be
    // present even when null.
    expect(
      Object.prototype.hasOwnProperty.call(res.body.user, 'thumbnail'),
    ).toBe(true);
    expect(res.body.lang).toBe('fr');
  });
});
