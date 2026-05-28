// Phase 4 lot 4 — verifies that a Google OAuth signup triggers
// `runOnActivation` (apiKey provisioning). Mirrors test 22's runOnActivation
// assertion for the email-verification path.

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

describe('34 - OAuth Google signup → runOnActivation fired (phase 4)', () => {
  let core;
  let services;
  let knex;
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
    app = buildApp(services, testConfig);
  });

  beforeEach(() => {
    server = buildOAuthServer(
      googleHandlers({
        aud: testConfig.auth.google.id,
        profile: {
          id: 'google-sub-34',
          email: 'g34@oa.test',
          name: 'Google User 34',
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

  it('provisions the user Inbox on first sign-in via Google', async () => {
    const agent = request.agent(app);
    const startRes = await agent
      .post('/api/auth/sign-in/social')
      .set('Content-Type', 'application/json')
      .send({ provider: 'google', callbackURL: '/home' });
    expect(startRes.status).toBe(200);
    const state = new URL(startRes.body.url).searchParams.get('state');
    const cookies = extractCookies(startRes.headers['set-cookie']);

    const callbackRes = await agent
      .get(`/api/auth/callback/google?code=fake-code&state=${state}`)
      .set('Cookie', cookies.join('; '))
      .redirects(0);
    expect(callbackRes.status).toBe(302);

    const dbUser = await knex(testConfig.schemas.user)
      .where({ email: 'g34@oa.test' })
      .first();
    expect(dbUser).toBeTruthy();

    const inbox = await new services.inboxes.Inbox({
      type: 'user',
      identifier: dbUser.uid,
    })._get();
    expect(inbox.data).toBeTruthy();
  });
});
