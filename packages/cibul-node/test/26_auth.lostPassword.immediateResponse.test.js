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

// Generous upper bound. BA's /api/auth/request-password-reset fans out the
// real send through `runInBackgroundOrAwait`, so the HTTP response returns
// in O(ms) and is independent of the email-existence path (anti-timing). On
// slow CI 1000 ms is comfortable while still flagging a regression where the
// response would block on the full BA roundtrip (≥ several seconds with the
// argon2 verify path).
const FAST_RESPONSE_MS = 1000;

describe('26 - /api/auth/request-password-reset replies immediately regardless of email existence (phase 6 lot 2)', () => {
  let core;
  let services;
  let usersSvc;
  let app;
  let sentMails;
  let originalSend;

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

    originalSend = services.mails.send.bind(services.mails);
  });

  beforeEach(() => {
    sentMails = [];
    services.mails.send = async (options) => {
      sentMails.push(options);
      return { status: true };
    };
  });

  beforeEach(() => flushRateLimit(services.redis));

  afterAll(async () => {
    services.mails.send = originalSend;
    await core.services.shutdown({ clear: true });
  });

  it('responds in well under 1s for a non-existent email and does not send any mail', async () => {
    const start = Date.now();
    const res = await request(app)
      .post('/api/auth/request-password-reset')
      .set('Content-Type', 'application/json')
      .send({ email: 'no-such-user-26@oa.test' });
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: true });
    expect(elapsed).toBeLessThan(FAST_RESPONSE_MS);

    // BA itself does not send a reset mail when the user is not found
    // (it short-circuits before sendResetPassword).
    await new Promise((r) => setTimeout(r, 300));
    const reset = sentMails.find((m) => m.template === 'resetPassword');
    expect(reset).toBeFalsy();
  });

  it('responds in well under 1s for an existing user and triggers the reset mail in background', async () => {
    const email = 'reset-26-bg@oa.test';
    const password = 'plainPwd-26-bg';

    await usersSvc.create(
      {
        fullName: 'Reset Background',
        email,
        password,
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    sentMails.length = 0;
    const start = Date.now();
    const res = await request(app)
      .post('/api/auth/request-password-reset')
      .set('Content-Type', 'application/json')
      .send({ email });
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: true });
    expect(elapsed).toBeLessThan(FAST_RESPONSE_MS);

    // Allow the background BA pipeline to invoke the mail send.
    await new Promise((r) => setTimeout(r, 500));
    const reset = sentMails.find((m) => m.template === 'resetPassword');
    expect(reset).toBeTruthy();
    expect(reset.to).toBe(email);
  });
});
