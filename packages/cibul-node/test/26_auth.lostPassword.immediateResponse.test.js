import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import resetFront from '../auth/reset.front.js';
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

// Generous upper bound. The endpoint replies before BA does any DB lookup
// (auth/reset.front.js fires the BA call without awaiting), so 1000 ms is a
// comfortable margin even on slow CI machines while still flagging a real
// regression where the response would block on the BA roundtrip
// (≥ several seconds with timing-attack mitigation).
const FAST_RESPONSE_MS = 1000;

describe('26 - /password/lost replies immediately regardless of email existence (phase 3b)', () => {
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
    app = buildApp(services, testConfig, { extend: (a) => resetFront(a) });

    originalSend = services.mails.send.bind(services.mails);
  });

  beforeEach(() => {
    sentMails = [];
    services.mails.send = async (options) => {
      sentMails.push(options);
      return { status: true };
    };
  });

  afterAll(async () => {
    services.mails.send = originalSend;
    await core.services.shutdown({ clear: true });
  });

  it('responds in well under 1s for a non-existent email and does not send any mail', async () => {
    const start = Date.now();
    const res = await request(app)
      .post('/password/lost')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email: 'no-such-user-26@oa.test' });
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
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
      .post('/password/lost')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email });
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
    expect(elapsed).toBeLessThan(FAST_RESPONSE_MS);

    // Allow the background BA pipeline to invoke the mail send.
    await new Promise((r) => setTimeout(r, 500));
    const reset = sentMails.find((m) => m.template === 'resetPassword');
    expect(reset).toBeTruthy();
    expect(reset.to).toBe(email);
  });
});
