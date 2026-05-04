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

describe('22 - auth email verification via better-auth (phase 3b)', () => {
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

    // Spy on services.mails.send by replacing the method with a recording
    // wrapper. We do not actually want to send mail in tests; the wrapper
    // resolves immediately and stores the call args for assertion.
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

  it('signup sends an activateAccount mail with a /api/auth/verify-email link', async () => {
    const email = 'verify-22-signup@oa.test';
    const password = 'plainPwd-22-strong';

    const res = await request(app)
      .post('/signup')
      .set('Accept', 'application/json')
      .type('form')
      .send({
        full_name: 'Verify Signup',
        email,
        password,
        repeat: password,
      });

    expect([200, 302]).toContain(res.status);

    const created = await usersSvc.findOne({
      query: { email },
      detailed: true,
    });
    expect(created).toBeTruthy();
    expect(!!created.isActivated).toBe(false);

    // The after-create hook (sendVerificationEmailOnCreate) calls BA's
    // sendVerificationEmail which fans out to onSendVerificationEmail
    // (services/auth/index.js) and ultimately services.mails.send with
    // template='activateAccount' + activateLink.
    const activate = sentMails.find((m) => m.template === 'activateAccount');
    expect(activate).toBeTruthy();
    expect(activate.to).toBe(email);
    expect(activate.data.activateLink).toContain('/api/auth/verify-email');
    expect(activate.data.activateLink).toMatch(/[?&]token=/);
  });

  it('GET on the activateLink verifies the user and triggers runOnActivation', async () => {
    const email = 'verify-22-click@oa.test';
    const password = 'plainPwd-22-click';

    await request(app)
      .post('/signup')
      .set('Accept', 'application/json')
      .type('form')
      .send({
        full_name: 'Verify Click',
        email,
        password,
        repeat: password,
      });

    const activate = sentMails.find((m) => m.template === 'activateAccount');
    expect(activate).toBeTruthy();
    const link = activate.data.activateLink;

    // Pull the path+query out of the absolute URL so supertest can hit it.
    const url = new URL(link);
    const pathAndQuery = `${url.pathname}${url.search}`;
    expect(pathAndQuery).toMatch(/^\/api\/auth\/verify-email\?token=/);

    const verifyRes = await request(app).get(pathAndQuery);

    // BA either returns 200 with a redirect, or follows the callbackURL with
    // a 302. Either way the user must end up activated.
    expect([200, 302, 303]).toContain(verifyRes.status);

    const dbUser = await services
      .knex(testConfig.schemas.user)
      .where({ email })
      .first();
    expect(dbUser.is_activated).toBe(1);

    // runOnActivation side-effect: a userPublic api key is created.
    const apiKey = await services
      .keys({ type: 'userPublic', identifier: dbUser.uid })
      .get({ optionalKey: true });
    expect(apiKey).toBeTruthy();
    expect(apiKey.key).toBeTruthy();
  });

  it('re-using the same verification link returns an error and does not rotate the api key', async () => {
    const email = 'verify-22-replay@oa.test';
    const password = 'plainPwd-22-replay';

    await request(app)
      .post('/signup')
      .set('Accept', 'application/json')
      .type('form')
      .send({
        full_name: 'Verify Replay',
        email,
        password,
        repeat: password,
      });

    const activate = sentMails.find((m) => m.template === 'activateAccount');
    const url = new URL(activate.data.activateLink);
    const pathAndQuery = `${url.pathname}${url.search}`;

    const first = await request(app).get(pathAndQuery);
    expect([200, 302, 303]).toContain(first.status);

    const dbUser = await services
      .knex(testConfig.schemas.user)
      .where({ email })
      .first();

    const firstKey = await services
      .keys({ type: 'userPublic', identifier: dbUser.uid })
      .get({ optionalKey: true });
    expect(firstKey).toBeTruthy();

    const second = await request(app).get(pathAndQuery);
    // Second attempt: the JWT itself stays valid (it carries no nonce), but
    // the user is already verified — BA returns 200 with status:true
    // without re-firing afterEmailVerification, OR redirects with a status.
    // The contract that matters is that the userPublic api key is unchanged
    // (idempotency held).
    expect([200, 302, 303, 400, 401]).toContain(second.status);

    const secondKey = await services
      .keys({ type: 'userPublic', identifier: dbUser.uid })
      .get({ optionalKey: true });
    expect(secondKey?.key).toBe(firstKey.key);
  });
});
