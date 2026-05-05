// Phase 4 lot 4 — integration test for the Google OAuth façade.
// Drives `/google/signin` -> `/api/auth/sign-in/social` -> provider mock
// (msw) -> `/api/auth/callback/google` -> redirect.
//
// Three scenarios:
//   A. New user signing up via Google → user row created, account row
//      provider=google created, session opened.
//   B. Existing user with backfilled account row → no new user, session
//      opened on the existing user.
//   C. Soft-removed user → after-hook guard purges the freshly-created
//      session and redirects to /signin?msg=accountUnavailable.

import request from 'supertest';
import googleFront from '../auth/google.front.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import buildApp from './helpers/buildApp.js';
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
    app = buildApp(services, testConfig, { extend: (a) => googleFront(a) });
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

  afterAll(async () => {
    await core.services.shutdown({ clear: true });
  });

  async function startSignin(agent) {
    const res = await agent.get('/google/signin').redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^https:\/\/accounts\.google\.com\//);
    const url = new URL(res.headers.location);
    const state = url.searchParams.get('state');
    expect(state).toBeTruthy();
    return {
      state,
      cookies: extractCookies(res.headers['set-cookie']),
    };
  }

  it('case A — new user → creates user + account row, opens session', async () => {
    const agent = request.agent(app);
    const { state, cookies } = await startSignin(agent);

    const callbackRes = await agent
      .get(`/api/auth/callback/google?code=fake-code&state=${state}`)
      .set('Cookie', cookies.join('; '))
      .redirects(0);
    expect(callbackRes.status).toBe(302);

    const dbUser = await knex(testConfig.schemas.user)
      .where({ email: 'g32@oa.test' })
      .first();
    expect(dbUser).toBeTruthy();
    expect(dbUser.is_activated).toBe(1);

    const accountRow = await knex(testConfig.schemas.account)
      .where({ provider_id: 'google', account_id: 'google-sub-32' })
      .first();
    expect(accountRow).toBeTruthy();
    expect(String(accountRow.user_id)).toBe(String(dbUser.id));
  });

  it('case B — existing backfilled user → opens session, no new row', async () => {
    const existing = await usersSvc.create(
      {
        fullName: 'Pre-existing G32',
        email: 'g32-existing@oa.test',
        password: 'plainPwd-g32-existing',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );
    const now = new Date();
    await knex(testConfig.schemas.account).insert({
      user_id: existing.id,
      account_id: 'google-sub-32-existing',
      provider_id: 'google',
      password: null,
      created_at: now,
      updated_at: now,
    });

    server.close();
    server = buildOAuthServer(
      googleHandlers({
        aud: testConfig.auth.google.id,
        profile: {
          id: 'google-sub-32-existing',
          email: 'g32-existing@oa.test',
          name: 'Pre-existing G32',
          email_verified: true,
        },
      }),
    );
    server.listen({ onUnhandledRequest: 'bypass' });

    const agent = request.agent(app);
    const { state, cookies } = await startSignin(agent);

    const before = await knex(testConfig.schemas.account)
      .where({ provider_id: 'google', account_id: 'google-sub-32-existing' })
      .count('* as n')
      .first();

    const callbackRes = await agent
      .get(`/api/auth/callback/google?code=fake-code&state=${state}`)
      .set('Cookie', cookies.join('; '))
      .redirects(0);
    expect(callbackRes.status).toBe(302);

    const after = await knex(testConfig.schemas.account)
      .where({ provider_id: 'google', account_id: 'google-sub-32-existing' })
      .count('* as n')
      .first();
    expect(Number(after.n)).toBe(Number(before.n));
  });

  it('case C — soft-removed user → guard redirects to /signin?msg=accountUnavailable', async () => {
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
