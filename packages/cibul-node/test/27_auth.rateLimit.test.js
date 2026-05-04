import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import buildApp from './helpers/buildApp.js';

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

// Lot 1 forces `rateLimit.enabled: true` in the wrapper so the limit applies
// regardless of NODE_ENV (BA defaults `enabled` to `isProduction`). The
// customRules are tight (1/60s) on the two endpoints that fan out to a real
// email send, so ordinary smoke testing won't trip them. We exercise both
// endpoints here to verify the 429 actually fires.
describe('27 - rate-limit on email-emitting endpoints (phase 3b)', () => {
  let core;
  let services;
  let app;
  let usersSvc;

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
    app = buildApp(services, testConfig);

    // Flush BA rate-limit keys so prior tests' /send-verification-email +
    // /request-password-reset attempts don't trip our 1/60s customRules
    // on the very first call here. The redis-storage prefix is
    // `{better-auth}:` (set in @openagenda/auth wrapper) and the key is
    // `${ip}|${path}` (better-auth's createRateLimitKey).
    const keys = await services.redis.keys('{better-auth}:*|/*');
    if (keys.length) await services.redis.del(...keys);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  it('declares a 1-per-60s custom rule for /send-verification-email', () => {
    const rule = services.auth.instance.options.rateLimit?.customRules?.[
      '/send-verification-email'
    ];
    expect(rule).toEqual({ window: 60, max: 1 });
  });

  it('declares a 1-per-60s custom rule for /request-password-reset', () => {
    const rule = services.auth.instance.options.rateLimit?.customRules?.[
      '/request-password-reset'
    ];
    expect(rule).toEqual({ window: 60, max: 1 });
  });

  it('429s on the second /send-verification-email within 60s', async () => {
    const email = 'rate-limit-send-27@oa.test';
    await usersSvc.create(
      {
        fullName: 'RL Send',
        email,
        password: 'plainPwd-27',
        isActivated: false,
      },
      { internal: true, detailed: true },
    );

    const first = await request(app)
      .post('/api/auth/send-verification-email')
      .set('Content-Type', 'application/json')
      .send({ email, callbackURL: '/home' });
    expect(first.status).toBeLessThan(400);

    const second = await request(app)
      .post('/api/auth/send-verification-email')
      .set('Content-Type', 'application/json')
      .send({ email, callbackURL: '/home' });
    expect(second.status).toBe(429);
  });

  it('429s on the second /request-password-reset within 60s', async () => {
    const email = 'rate-limit-reset-27@oa.test';
    await usersSvc.create(
      {
        fullName: 'RL Reset',
        email,
        password: 'plainPwd-27',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const first = await request(app)
      .post('/api/auth/request-password-reset')
      .set('Content-Type', 'application/json')
      .send({ email, redirectTo: '/password/reset' });
    expect(first.status).toBeLessThan(400);

    const second = await request(app)
      .post('/api/auth/request-password-reset')
      .set('Content-Type', 'application/json')
      .send({ email, redirectTo: '/password/reset' });
    expect(second.status).toBe(429);
  });
});
