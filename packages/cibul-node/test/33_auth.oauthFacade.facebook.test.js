// Phase 4 lot 4 — integration test for the Facebook OAuth façade.
//
// Three scenarios:
//   A. Existing user with backfilled account row → signin OK.
//   B. User still carrying `facebook_uid` (legacy phase-out) → callback
//      redirect rewritten to /settings/unlinkFacebook regardless of where
//      `callbackURL` points.
//   C. Unknown user (`disableImplicitSignUp: true`) → BA redirects to
//      /error?error=signup_disabled (split from "signup disabled").
//
// FB does not use id_token by default — we mock the access_token endpoint
// and the /me?fields=… profile endpoint.

import request from 'supertest';
import facebookFront from '../auth/facebook.front.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import buildApp from './helpers/buildApp.js';
import { buildOAuthServer, facebookHandlers } from './helpers/oauthMocks.js';

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

describe('33 - auth Facebook OAuth façade (phase 4)', () => {
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
    app = buildApp(services, testConfig, { extend: (a) => facebookFront(a) });
  });

  afterEach(() => {
    if (server) server.close();
  });

  afterAll(async () => {
    await core.services.shutdown({ clear: true });
  });

  function startServer(profile) {
    server = buildOAuthServer(facebookHandlers({ profile }));
    server.listen({ onUnhandledRequest: 'bypass' });
  }

  async function startSignin(agent) {
    const res = await agent.get('/facebook/signin').redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^https:\/\/www\.facebook\.com\//);
    const url = new URL(res.headers.location);
    const state = url.searchParams.get('state');
    expect(state).toBeTruthy();
    return {
      state,
      cookies: extractCookies(res.headers['set-cookie']),
    };
  }

  it('case A — existing backfilled user → opens session', async () => {
    const existing = await usersSvc.create(
      {
        fullName: 'FB Existing 33',
        email: 'fb33-existing@oa.test',
        password: 'plainPwd-fb33',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );
    const now = new Date();
    await knex(testConfig.schemas.account).insert({
      user_id: existing.id,
      account_id: 'fb-uid-33-existing',
      provider_id: 'facebook',
      password: null,
      created_at: now,
      updated_at: now,
    });

    startServer({
      id: 'fb-uid-33-existing',
      name: 'FB Existing 33',
      email: 'fb33-existing@oa.test',
      picture: { data: { url: 'http://localhost/p.jpg' } },
    });

    const agent = request.agent(app);
    const { state, cookies } = await startSignin(agent);

    const callbackRes = await agent
      .get(`/api/auth/callback/facebook?code=fake-code&state=${state}`)
      .set('Cookie', cookies.join('; '))
      .redirects(0);
    expect(callbackRes.status).toBe(302);
    // Sanity: the callback resolved to the success branch, not /error.
    expect(callbackRes.headers.location).not.toMatch(/\/error/);
    expect(callbackRes.headers.location).not.toMatch(/error=/);
  });

  it('case B — user with legacy facebook_uid → forced redirect to /settings/unlinkFacebook', async () => {
    const linked = await usersSvc.create(
      {
        fullName: 'FB Linked 33',
        email: 'fb33-linked@oa.test',
        password: 'plainPwd-fb33-linked',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );
    const now = new Date();
    await knex(testConfig.schemas.account).insert({
      user_id: linked.id,
      account_id: 'fb-uid-33-linked',
      provider_id: 'facebook',
      password: null,
      created_at: now,
      updated_at: now,
    });
    await knex(testConfig.schemas.user)
      .where({ id: linked.id })
      .update({ facebook_uid: 'fb-uid-33-linked' });

    startServer({
      id: 'fb-uid-33-linked',
      name: 'FB Linked 33',
      email: 'fb33-linked@oa.test',
      picture: { data: { url: 'http://localhost/p.jpg' } },
    });

    const agent = request.agent(app);
    const { state, cookies } = await startSignin(agent);

    const callbackRes = await agent
      .get(`/api/auth/callback/facebook?code=fake-code&state=${state}`)
      .set('Cookie', cookies.join('; '))
      .redirects(0);
    expect(callbackRes.status).toBe(302);
    expect(callbackRes.headers.location).toMatch(/\/settings\/unlinkFacebook/);
  });

  it('case C — unknown user with disableImplicitSignUp → redirect with error=signup_disabled', async () => {
    startServer({
      id: 'fb-uid-33-unknown',
      name: 'FB Unknown 33',
      email: 'fb33-unknown@oa.test',
      picture: { data: { url: 'http://localhost/p.jpg' } },
    });

    const agent = request.agent(app);
    const { state, cookies } = await startSignin(agent);

    const callbackRes = await agent
      .get(`/api/auth/callback/facebook?code=fake-code&state=${state}`)
      .set('Cookie', cookies.join('; '))
      .redirects(0);
    expect(callbackRes.status).toBe(302);
    expect(callbackRes.headers.location).toMatch(/error=signup_disabled/);
  });
});
