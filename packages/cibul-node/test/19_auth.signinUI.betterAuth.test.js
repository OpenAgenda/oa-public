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

describe('19 - auth signin UI via better-auth (phase 3)', () => {
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
    app = buildApp(services, testConfig);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  it('returns JSON success + sets oa session cookie on valid credentials', async () => {
    const email = 'signin-ok@oa.test';
    const password = 'plainPwd-19';
    await usersSvc.create(
      { fullName: 'Signin Ok', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const res = await request(app)
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
    expect(res.body.redirect).toBeDefined();
    const cookies = [].concat(res.headers['set-cookie'] || []).join(';');
    expect(cookies).toMatch(/oa\.session_token/);
  });

  it('redirects to /signup/complete when user is not activated', async () => {
    const email = 'signin-inactive@oa.test';
    const password = 'plainPwd-19';
    await usersSvc.create(
      { fullName: 'Signin Inactive', email, password, isActivated: false },
      { internal: true, detailed: true },
    );

    const res = await request(app)
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email, password });

    // signin on a non-activated user calls redirectToResend → redirectToComplete
    // with resend=true, which routes to /activate/resend?email=… (not the
    // /signup/complete branch).
    const redirect = res.body.redirect || res.headers.location;
    expect(redirect).toMatch(
      new RegExp(
        `^/activate/resend\\?[^\\s]*email=${encodeURIComponent(email)}`,
      ),
    );
  });

  it('returns 400 with error label on wrong password', async () => {
    const email = 'signin-bad@oa.test';
    const password = 'plainPwd-19';
    await usersSvc.create(
      { fullName: 'Signin Bad', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const res = await request(app)
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email, password: 'nope-' });

    expect(res.status).toBe(400);
    expect(res.body?.errors?.password).toBeDefined();
  });

  it('rejects blacklisted users (guard from phase 2b) and does not leak a session cookie', async () => {
    const email = 'signin-bl@oa.test';
    const password = 'plainPwd-19';
    const user = await usersSvc.create(
      { fullName: 'Signin Bl', email, password, isActivated: true },
      { internal: true, detailed: true },
    );
    await services
      .knex(testConfig.schemas.user)
      .where({ id: user.id })
      .update({ is_blacklisted: 1 });

    const res = await request(app)
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email, password });

    expect(res.status).toBe(400);

    // Regression: the better-auth `before` guard rejects before signInEmail
    // emits any session cookie. No session_token must leak to the response,
    // even with an empty value — the cookie must simply not be present.
    const setCookies = [].concat(res.headers['set-cookie'] || []);
    const sessionTokenCookies = setCookies.filter((c) =>
      /oa\.session_token=/.test(c));
    expect(sessionTokenCookies).toEqual([]);
  });

  it('honors a base64 redirect query parameter', async () => {
    const email = 'signin-redir@oa.test';
    const password = 'plainPwd-19';
    await usersSvc.create(
      { fullName: 'Signin Redir', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const target = '/some/agenda/page';
    const encoded = Buffer.from(target).toString('base64');

    const res = await request(app)
      .post(`/signin?redirect=${encodeURIComponent(encoded)}`)
      .set('Accept', 'application/json')
      .type('form')
      .send({ email, password });

    expect(res.body.redirect).toBe(target);
  });

  it('GET /signout clears the session cookie', async () => {
    const email = 'signout-19@oa.test';
    const password = 'plainPwd-19';
    await usersSvc.create(
      { fullName: 'Signout 19', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email, password });

    const out = await agent.get('/signout');
    const cookies = [].concat(out.headers['set-cookie'] || []).join(';');
    expect(cookies).toMatch(
      /oa\.session_token=;|oa\.session_token=$|expires=Thu, 01 Jan 1970/i,
    );
  });
});
