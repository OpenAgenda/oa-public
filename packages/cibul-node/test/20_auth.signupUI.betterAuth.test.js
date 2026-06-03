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
  let sentMails;
  let originalSend;

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

    // Record mails instead of sending them (same pattern as test 22). The
    // duplicate-email branch now fans out to services.mails.send via
    // onExistingUserSignUp, so we must not hit real SMTP here.
    originalSend = services.mails.send.bind(services.mails);
  });

  beforeEach(() => {
    sentMails = [];
    services.mails.send = async (options) => {
      sentMails.push(options);
      return { status: true };
    };
  });

  beforeEach(() => flushRateLimit(services.redis));

  afterAll(async () => {
    services.mails.send = originalSend;
    await core.services.shutdown({ clear: true });
  });

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

    // Private email channel: the existing (activated) owner is notified via
    // their inbox that a signup was attempted and an account already exists,
    // with links to log in / reset password. The screen stays generic.
    const notice = sentMails.find((m) => m.template === 'accountAlreadyExists');
    expect(notice).toBeTruthy();
    expect(notice.to).toBe(email);
    // lang falls back to a built locale when culture is null (legacy rows).
    expect(notice.lang).toBe(stillThere.culture || 'en');
    expect(notice.data.loginLink).toContain('/auth/signin');
    expect(notice.data.resetLink).toContain('view=lost');
    // Queued (background) so the anti-enumeration response is never blocked
    // on SMTP I/O.
    expect(notice.queue).toBe(true);
    // Anti-enumeration: no activation mail leaks (would imply a fresh signup).
    expect(sentMails.some((m) => m.template === 'activateAccount')).toBe(false);
  });

  it('signup on an existing UNACTIVATED email resends the activation link', async () => {
    // The owner never finished their first signup. A re-attempt should help
    // them complete it (resend activateAccount) rather than dead-ending on a
    // "log in / reset password" notice they cannot act on yet.
    const email = 'signup-collision-inactive@oa.test';
    await usersSvc.create(
      {
        fullName: 'Pending User',
        email,
        password: 'plainPwd-20-pending',
        isActivated: false,
      },
      { internal: true, detailed: true },
    );

    const res = await request(app)
      .post('/api/auth/sign-up/email')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Retry Pending Email',
        full_name: 'Retry Pending Email',
        email,
        password: 'plainPwd-20-retry',
        repeat: 'plainPwd-20-retry',
      });

    expect(res.status).toBe(200);

    // Still a single row — no duplicate account created.
    const rows = await services
      .knex(testConfig.schemas.user)
      .where({ email })
      .count('* as n')
      .first();
    expect(Number(rows.n)).toBe(1);

    // Activation link re-sent; the "account exists" notice is NOT used here.
    const activate = sentMails.find((m) => m.template === 'activateAccount');
    expect(activate).toBeTruthy();
    expect(activate.to).toBe(email);
    expect(activate.data.activateLink).toContain('/api/auth/verify-email');
    expect(sentMails.some((m) => m.template === 'accountAlreadyExists')).toBe(
      false,
    );
  });
});
