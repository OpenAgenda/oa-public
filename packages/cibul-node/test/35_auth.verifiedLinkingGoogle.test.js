// Phase 4 lot 4.5 — end-to-end verified-linking flow for Google.
//
// Covers the full path an existing OA user (email/password, no `account`
// row for Google) takes when clicking "Sign in with Google":
//   1. /google/signin -> BA sign-in/social -> Google mock -> callback BA
//   2. BA refuses the auto-link (`disableImplicitLinking`) and redirects
//      to `errorCallbackURL=/auth/signin?linkProvider=google&error=...`.
//      `mapProfileToUser` stashed the email on the async-context, so the
//      after-hook appended `&email=<encoded>` to the redirect.
//   3. The user submits POST /signin with email + password + linkProvider
//      → cibul-node opens the BA session, then calls `linkSocialAccount`
//      which returns a Google authorization URL carrying the link state.
//   4. The browser hits Google again, gets redirected to /api/auth/callback
//      → BA's callback finds the link state + the active session, hits the
//      `if (link)` branch in callback.mjs, and finalises the link.
//   5. Result: an `account` row provider=google is created for the user,
//      with `(provider_id, account_id)` matching the Google sub.

import request from 'supertest';
import googleFront from '../auth/google.front.js';
import localFront from '../auth/local.front.js';
import generalFront from '../general/front.js';
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

function extractCookies(setCookie) {
  if (!setCookie) return [];
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  return arr.map((c) => c.split(';')[0]);
}

describe('35 - verified-linking Google end-to-end (phase 4 lot 4.5)', () => {
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
    app = buildApp(services, testConfig, {
      extend: (a) => {
        googleFront(a);
        localFront(a);
        generalFront(a);
      },
    });
  });

  afterEach(() => {
    if (server) server.close();
  });

  afterAll(async () => {
    await core.services.shutdown({ clear: true });
  });

  function startServer(profile) {
    server = buildOAuthServer(
      googleHandlers({ aud: testConfig.auth.google.id, profile }),
    );
    server.listen({ onUnhandledRequest: 'bypass' });
  }

  async function followToGoogle(agent, path) {
    const res = await agent.get(path).redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^https:\/\/accounts\.google\.com\//);
    const url = new URL(res.headers.location);
    return {
      state: url.searchParams.get('state'),
      cookies: extractCookies(res.headers['set-cookie']),
    };
  }

  it('full flow: account_not_linked → password challenge → link finalised', async () => {
    // Step 0: an OA user that exists with email+password but no Google link.
    const user = await usersSvc.create(
      {
        fullName: 'Verified Link 35',
        email: 'vl35@oa.test',
        password: 'plainPwd-vl35',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    startServer({
      id: 'google-sub-vl35',
      email: 'vl35@oa.test',
      name: 'Verified Link 35',
      email_verified: true,
    });

    const agent = request.agent(app);

    // Step 1-2: kick off the OAuth flow, then drive the callback. BA
    // matches the user by email but has no `account` row → redirects to
    // errorCallbackURL with email pre-filled by mapProfileToUser.
    const start = await followToGoogle(agent, '/google/signin');
    const callbackRes = await agent
      .get(`/api/auth/callback/google?code=fake-code&state=${start.state}`)
      .set('Cookie', start.cookies.join('; '))
      .redirects(0);
    expect(callbackRes.status).toBe(302);
    expect(callbackRes.headers.location).toContain(
      '/auth/signin?linkProvider=google',
    );
    expect(callbackRes.headers.location).toContain('error=account_not_linked');
    expect(callbackRes.headers.location).toContain(
      `email=${encodeURIComponent('vl35@oa.test')}`,
    );

    // Sanity: still no row at this point.
    const beforeLink = await knex(testConfig.schemas.account)
      .where({ provider_id: 'google', account_id: 'google-sub-vl35' })
      .first();
    expect(beforeLink).toBeUndefined();

    // Step 3: password challenge. POSTing to /signin with linkProvider
    // opens the BA session via signInEmail and chains to /link-social.
    // We need a fresh agent since BA already set state cookies on the
    // first one — supertest replays them and BA refuses the new flow.
    const linkAgent = request.agent(app);
    const submit = await linkAgent
      .post('/signin')
      .type('form')
      .set('Accept', 'application/json')
      .send({
        email: 'vl35@oa.test',
        password: 'plainPwd-vl35',
        linkProvider: 'google',
      });
    expect(submit.status).toBe(200);
    expect(submit.body.success).toBe(true);
    expect(submit.body.redirect).toMatch(/^https:\/\/accounts\.google\.com\//);

    // Step 4: replay the second Google round-trip. The state cookie from
    // /link-social is on `linkAgent`; we extract `state` from the URL
    // returned by the password challenge and hit /api/auth/callback again.
    const linkUrl = new URL(submit.body.redirect);
    const linkState = linkUrl.searchParams.get('state');
    expect(linkState).toBeTruthy();

    const linkCallback = await linkAgent
      .get(`/api/auth/callback/google?code=fake-code-link&state=${linkState}`)
      .redirects(0);
    expect(linkCallback.status).toBe(302);
    // Success path: BA followed the `if (link)` branch and redirected to
    // the configured callbackURL (`/home`). On error it would have gone
    // back to /auth/signin?linkError=1.
    expect(linkCallback.headers.location).not.toContain('linkError=1');

    // Step 5: the row is now in `account`.
    const afterLink = await knex(testConfig.schemas.account)
      .where({ provider_id: 'google', account_id: 'google-sub-vl35' })
      .first();
    expect(afterLink).toBeTruthy();
    expect(String(afterLink.user_id)).toBe(String(user.id));
  });

  it('linkError=1 redirect: bad password keeps the user on /signin without linking', async () => {
    await usersSvc.create(
      {
        fullName: 'Verified Link Bad 35',
        email: 'vl35-bad@oa.test',
        password: 'plainPwd-vl35-bad',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    startServer({
      id: 'google-sub-vl35-bad',
      email: 'vl35-bad@oa.test',
      name: 'Verified Link Bad 35',
      email_verified: true,
    });

    // Bad password → signInEmail rejects → no session opened, the linking
    // branch is never entered. We just check the response is the standard
    // signin failure (400 + errors.password from signinError).
    const linkAgent = request.agent(app);
    const submit = await linkAgent
      .post('/signin')
      .type('form')
      .set('Accept', 'application/json')
      .send({
        email: 'vl35-bad@oa.test',
        password: 'WRONG',
        linkProvider: 'google',
      });
    expect(submit.status).toBe(400);
    expect(submit.body.errors?.password).toBeTruthy();

    // No `account` row created.
    const row = await knex(testConfig.schemas.account)
      .where({ provider_id: 'google', account_id: 'google-sub-vl35-bad' })
      .first();
    expect(row).toBeUndefined();
  });
});
