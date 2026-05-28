import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
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
  'trackers',
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
// email send. The unit tests in @openagenda/auth (07_emailVerification_send,
// 08_resetPassword_send) already check the rule is declared in the
// instance.options — we only assert the integration here: when BA is
// actually mounted in cibul-node and exercised over HTTP, the second call
// inside the window returns 429.
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
  });

  beforeEach(() => flushRateLimit(services.redis));

  afterAll(() => core.services.shutdown({ clear: true }));

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
