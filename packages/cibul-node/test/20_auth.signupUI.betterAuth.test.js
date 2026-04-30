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

describe('20 - auth signup UI via better-auth (phase 3)', () => {
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

  it('creates a user (isActivated=false), redirects to signup/complete, no session opened', async () => {
    const email = 'signup-new@oa.test';
    const password = 'plainPwd-20-new';

    const res = await request(app)
      .post('/signup')
      .set('Accept', 'application/json')
      .type('form')
      .send({
        full_name: 'Signup New',
        email,
        password,
        repeat: password,
      });

    const created = await usersSvc.findOne({
      query: { email },
      detailed: true,
    });
    expect(created).toBeTruthy();
    expect(!!created.isActivated).toBe(false);

    const redirect = res.body?.redirect || res.headers.location;
    expect(redirect).toMatch(/signup\/complete|activate/);

    const cookies = [].concat(res.headers['set-cookie'] || []).join(';');
    expect(cookies).not.toMatch(/oa\.session_token=[A-Za-z0-9]/);
  });

  it('rejects when passwords do not match', async () => {
    const res = await request(app)
      .post('/signup')
      .set('Accept', 'application/json')
      .type('form')
      .send({
        full_name: 'Mismatch',
        email: 'signup-mismatch@oa.test',
        password: 'plainPwd-20-strong-x9',
        repeat: 'different-strong-99',
      });

    expect(res.status).toBe(400);
    expect(res.body?.errors?.repeat).toBeDefined();
  });

  it('rejects signup when the email is already taken (400 + errors.email)', async () => {
    const email = 'signup-collision@oa.test';
    await usersSvc.create(
      {
        fullName: 'Existing User',
        email,
        password: 'plainPwd-20-exist',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const res = await request(app)
      .post('/signup')
      .set('Accept', 'application/json')
      .type('form')
      .send({
        full_name: 'Second Tries Same Email',
        email,
        password: 'plainPwd-20-collide',
        repeat: 'plainPwd-20-collide',
      });

    expect(res.status).toBe(400);
    // checkUnicity throws BadRequest('Already exist') → signupSubmit maps to
    // errors.email = 'usedEmail'.
    expect(res.body?.errors?.email).toBe('usedEmail');
  });
});
