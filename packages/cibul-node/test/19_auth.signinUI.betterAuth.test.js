// Phase 6 Lot 2 — the legacy `/signin` Express wrapper is gone, the form
// posts directly to BA's `/api/auth/sign-in/email`. These tests pin the OA
// hooks wired around BA's vanilla path: the EMAIL_NOT_VERIFIED gate
// (sign-in.before in @openagenda/auth) and the blacklisted-user guard
// (services/auth/index.js). We don't re-test happy-path BA flows: those
// belong to the @openagenda/auth unit suite. We keep `generalFront` mounted
// because /signout is still the OA-side route the form hits after BA tears
// the cookie down.

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

describe('19 - auth signin UI via better-auth (phase 6 lot 2)', () => {
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

  it('403 EMAIL_NOT_VERIFIED for an unactivated user (Next surfaces the inline resend panel)', async () => {
    const email = 'signin-inactive@oa.test';
    const password = 'plainPwd-19';
    await usersSvc.create(
      { fullName: 'Signin Inactive', email, password, isActivated: false },
      { internal: true, detailed: true },
    );

    const res = await request(app)
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    expect(res.status).toBe(403);
    expect(res.body?.code).toBe('EMAIL_NOT_VERIFIED');
    // Defence-in-depth: BA must never set the session cookie before the
    // emailVerified gate.
    const setCookies = [].concat(res.headers['set-cookie'] || []);
    const sessionCookies = setCookies.filter((c) =>
      /oa\.session_token=/.test(c));
    expect(sessionCookies).toEqual([]);
  });

  it('rejects blacklisted users without leaking a session cookie (phase 2b guard)', async () => {
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
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    // BA's `before` hook in @openagenda/auth throws UNAUTHORIZED with
    // INVALID_EMAIL_OR_PASSWORD before signInEmail emits any cookie. No
    // session_token must leak to the response.
    expect(res.status).toBe(401);
    const setCookies = [].concat(res.headers['set-cookie'] || []);
    const sessionTokenCookies = setCookies.filter((c) =>
      /oa\.session_token=/.test(c));
    expect(sessionTokenCookies).toEqual([]);
  });
});
