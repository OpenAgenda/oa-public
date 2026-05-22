// Phase 6 lot 2 — the legacy `/facebook/signin` Express wrapper is gone,
// the Next signin form posts directly to BA's `POST /api/auth/sign-in/social`.
// We pin the OA-specific Facebook contract: users still carrying a legacy
// `facebook_uid` column must be force-routed to /settings/unlinkFacebook
// regardless of the requested callbackURL (`unlinkFacebook` phase-out path
// in services/auth/index.js). Vanilla "existing user signs in" and BA's
// disableImplicitSignUp redirect are flows whose logic lives in
// @openagenda/auth / better-auth — covered by the BA package tests.

import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import buildApp from './helpers/buildApp.js';
import flushRateLimit from './helpers/rateLimit.js';
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
    app = buildApp(services, testConfig);
  });

  afterEach(() => {
    if (server) server.close();
  });

  beforeEach(() => flushRateLimit(services.redis));

  afterAll(async () => {
    await core.services.shutdown({ clear: true });
  });

  function startServer(profile) {
    server = buildOAuthServer(facebookHandlers({ profile }));
    server.listen({ onUnhandledRequest: 'bypass' });
  }

  async function startSignin(agent) {
    const res = await agent
      .post('/api/auth/sign-in/social')
      .set('Content-Type', 'application/json')
      .send({ provider: 'facebook', callbackURL: '/home' });
    expect(res.status).toBe(200);
    expect(res.body?.url).toMatch(/^https:\/\/www\.facebook\.com\//);
    const url = new URL(res.body.url);
    const state = url.searchParams.get('state');
    expect(state).toBeTruthy();
    return {
      state,
      cookies: extractCookies(res.headers['set-cookie']),
    };
  }

  it('user with legacy facebook_uid → forced redirect to /settings/unlinkFacebook', async () => {
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
});
