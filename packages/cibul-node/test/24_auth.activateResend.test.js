import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import localFront from '../auth/local.front.js';
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

describe('24 - /activate/resend re-issues a BA verification token (phase 3b)', () => {
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
    app = buildApp(services, testConfig, { extend: (a) => localFront(a) });

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

  it('re-issues a BA verification email when the user is not activated', async () => {
    const email = 'resend-24@oa.test';
    const password = 'plainPwd-24-resend';

    await usersSvc.create(
      {
        fullName: 'Resend Target',
        email,
        password,
        isActivated: false,
      },
      { internal: true, detailed: true },
    );

    // Drain mails captured by the after-create hook (BA's sendVerificationEmail
    // fires once on user creation); we want to assert specifically on the
    // resend flow.
    sentMails.length = 0;

    // The /activate/resend route (auth/local.front.js:activateResend) calls
    // auth.api.sendVerificationEmail({ body: { email, callbackURL } }) which
    // routes through onSendVerificationEmail → services.mails.send.
    const res = await request(app).get(
      `/activate/resend?email=${encodeURIComponent(email)}`,
    );
    expect(res.status).toBeLessThan(500);

    const activate = sentMails.find((m) => m.template === 'activateAccount');
    expect(activate).toBeTruthy();
    expect(activate.to).toBe(email);
    expect(activate.data.activateLink).toContain('/api/auth/verify-email');
    expect(activate.data.activateLink).toMatch(/[?&]token=/);
  });

  it('does not send anything when the user is already activated', async () => {
    const email = 'resend-24-already-activated@oa.test';
    const password = 'plainPwd-24-already';

    await usersSvc.create(
      {
        fullName: 'Already Active',
        email,
        password,
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    await request(app).get(
      `/activate/resend?email=${encodeURIComponent(email)}`,
    );

    const activate = sentMails.find((m) => m.template === 'activateAccount');
    expect(activate).toBeFalsy();
  });
});
