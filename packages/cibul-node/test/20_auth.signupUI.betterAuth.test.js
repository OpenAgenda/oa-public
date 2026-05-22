// Phase 6 Lot 2 — the legacy `/signup` Express wrapper is gone, the form
// posts directly to BA's `/api/auth/sign-up/email`. We pin two things here:
//   - cibul-node's `validateSignUp` callback (services/auth/index.js) returns
//     400 with the OA-shaped `details.repeat`/`details.password` errors,
//   - BA's `requireEmailVerification: true` flag (set by @openagenda/auth)
//     enables the anti-enumeration synthetic response on duplicate email,
//     which OA depends on for not leaking account existence.
// Vanilla "creates a user" path is covered by @openagenda/auth + drizzle
// adapter unit tests, no need to re-prove it here.

import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
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

describe('20 - auth signup UI via better-auth (phase 6 lot 2)', () => {
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

  beforeEach(() => flushRateLimit(services.redis));

  afterAll(() => core.services.shutdown({ clear: true }));

  it('rejects when passwords do not match (validateSignUp returns errors.repeat)', async () => {
    const res = await request(app)
      .post('/api/auth/sign-up/email')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Mismatch',
        full_name: 'Mismatch',
        email: 'signup-mismatch@oa.test',
        password: 'plainPwd-20-strong-x9',
        repeat: 'different-strong-99',
      });

    expect(res.status).toBe(400);
    expect(res.body?.details?.repeat).toBeDefined();
  });

  it('anti-enumeration on already-taken email: 200 with synthetic user, no new DB row', async () => {
    // BA's `requireEmailVerification: true` flag (set in @openagenda/auth)
    // turns on `shouldReturnGenericDuplicateResponse` server-side: BA hashes
    // the supplied password to flatten timing, then returns a freshly minted
    // synthetic user response without ever inserting a row. The contract
    // matters — we must NOT leak the existence of the original account.
    const email = 'signup-collision@oa.test';
    const original = await usersSvc.create(
      {
        fullName: 'Existing User',
        email,
        password: 'plainPwd-20-exist',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const res = await request(app)
      .post('/api/auth/sign-up/email')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Second Tries Same Email',
        full_name: 'Second Tries Same Email',
        email,
        password: 'plainPwd-20-collide',
        repeat: 'plainPwd-20-collide',
      });

    expect(res.status).toBe(200);

    // No second row in the user table.
    const rows = await services
      .knex(testConfig.schemas.user)
      .where({ email })
      .count('* as n')
      .first();
    expect(Number(rows.n)).toBe(1);

    // The original user row is unchanged.
    const stillThere = await services
      .knex(testConfig.schemas.user)
      .where({ id: original.id })
      .first();
    expect(stillThere).toBeTruthy();
    expect(stillThere.email).toBe(email);
  });
});
