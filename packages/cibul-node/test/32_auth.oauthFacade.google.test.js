// Phase 6 lot 2 — the legacy `/google/signin` Express wrapper is gone.
// The Next signin form posts directly to BA's `POST /api/auth/sign-in/social`
// to start the OAuth dance. Same downstream contract: BA → Google mock
// (msw) → `/api/auth/callback/google` → redirect.
//
// We pin the OA-specific contract here: the soft-removed-user guard wired
// in services/auth/index.js. New-user creation and existing-user signin via
// Google are both BA-vanilla flows whose business logic lives in
// @openagenda/auth + the drizzle adapter — no wrapper-side wiring of ours
// to validate. Test 34 separately covers the runOnActivation side-effect on
// the OAuth signup path, and test 35 the verified-linking custom flow.

import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import buildApp from './helpers/buildApp.js';
import flushRateLimit from './helpers/rateLimit.js';
import { buildOAuthServer, googleHandlers } from './helpers/oauthMocks.js';

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

// Pull the BA `state` cookie out of a Set-Cookie list so we can replay it on
// the callback request — without it BA rejects the callback as a CSRF.
function extractCookies(setCookie) {
  if (!setCookie) return [];
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  return arr.map((c) => c.split(';')[0]);
}

describe('32 - auth Google OAuth façade (phase 4)', () => {
  let core;
  let services;
  let knex;
  let usersSvc;
  let app;
  let server;

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
    knex = services.knex;
    usersSvc = services.users;
    app = buildApp(services, testConfig);
  });

  beforeEach(() => {
    server = buildOAuthServer(
      googleHandlers({
        aud: testConfig.auth.google.id,
        profile: {
          id: 'google-sub-32',
          email: 'g32@oa.test',
          name: 'Google User 32',
          email_verified: true,
        },
      }),
    );
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.close();
  });

  beforeEach(() => flushRateLimit(services.redis));

  afterAll(async () => {
    await core.services.shutdown({ clear: true });
  });

  async function startSignin(agent) {
    // BA's POST /sign-in/social returns `{ url, redirect: true }` plus the
    // state cookie via Set-Cookie. The Next form just navigates to the URL;
    // here we extract the `state` query param + cookie so we can replay them
    // on the callback request.
    const res = await agent
      .post('/api/auth/sign-in/social')
      .set('Content-Type', 'application/json')
      .send({ provider: 'google', callbackURL: '/home' });
    expect(res.status).toBe(200);
    expect(res.body?.url).toMatch(/^https:\/\/accounts\.google\.com\//);
    const url = new URL(res.body.url);
    const state = url.searchParams.get('state');
    expect(state).toBeTruthy();
    return {
      state,
      cookies: extractCookies(res.headers['set-cookie']),
    };
  }

  it('soft-removed user → guard redirects to /signin?msg=accountUnavailable', async () => {
    const removed = await usersSvc.create(
      {
        fullName: 'Removed G32',
        email: 'g32-removed@oa.test',
        password: 'plainPwd-g32-removed',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );
    const now = new Date();
    await knex(testConfig.schemas.account).insert({
      user_id: removed.id,
      account_id: 'google-sub-32-removed',
      provider_id: 'google',
      password: null,
      created_at: now,
      updated_at: now,
    });
    await knex(testConfig.schemas.user)
      .where({ id: removed.id })
      .update({ is_removed: 1 });

    server.close();
    server = buildOAuthServer(
      googleHandlers({
        aud: testConfig.auth.google.id,
        profile: {
          id: 'google-sub-32-removed',
          email: 'g32-removed@oa.test',
          name: 'Removed G32',
          email_verified: true,
        },
      }),
    );
    server.listen({ onUnhandledRequest: 'bypass' });

    const agent = request.agent(app);
    const { state, cookies } = await startSignin(agent);

    const callbackRes = await agent
      .get(`/api/auth/callback/google?code=fake-code&state=${state}`)
      .set('Cookie', cookies.join('; '))
      .redirects(0);
    expect(callbackRes.status).toBe(302);
    expect(callbackRes.headers.location).toMatch(
      /\/signin\?msg=accountUnavailable/,
    );
  });
});
