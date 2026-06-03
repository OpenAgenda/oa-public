import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import buildApp from './helpers/buildApp.js';
import flushRateLimit from './helpers/rateLimit.js';
import waitFor from './helpers/waitFor.js';
import { getCredentialAccount } from './helpers/account.js';

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

// BA's email-emitted reset URL is shaped:
//   ${baseURL}/api/auth/reset-password/${verificationToken}?callbackURL=...
// We extract `verificationToken` so we can drive
// auth.api.resetPassword({ body: { token, newPassword } }) directly without
// going through the redirect dance.
function extractResetToken(resetLink) {
  const url = new URL(resetLink);
  const segs = url.pathname.split('/');
  return segs[segs.length - 1];
}

describe('25 - reset password via better-auth (phase 3b)', () => {
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

  it('emits a resetPassword mail and rewrites password to argon2id', async () => {
    const email = 'reset-25-active@oa.test';
    const oldPassword = 'plainPwd-25-active-old';
    const newPassword = 'plainPwd-25-active-new';

    const user = await usersSvc.create(
      {
        fullName: 'Reset Active',
        email,
        password: oldPassword,
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    // Phase 2a dual-write: account.password should be the legacy sha256 sentinel.
    const before = await getCredentialAccount(
      services.knex,
      user.id,
      testConfig.schemas,
    );
    expect(before).toBeTruthy();
    expect(before.password.startsWith('legacy-sha256$')).toBe(true);

    // POST /password/lost — endpoint replies 200 immediately, real work is
    // backgrounded. Wait briefly for the BA pipeline to invoke
    // onSendPasswordResetEmail → services.mails.send.
    const lostRes = await request(app)
      .post('/api/auth/request-password-reset')
      .set('Content-Type', 'application/json')
      .send({ email });

    expect(lostRes.status).toBe(200);

    // The mail send is backgrounded by the BA pipeline; poll for it instead of
    // racing a fixed sleep.
    const reset = await waitFor(
      () => sentMails.find((m) => m.template === 'resetPassword'),
      { message: 'resetPassword mail to be sent' },
    );
    expect(reset.to).toBe(email);
    expect(reset.data.resetLink).toMatch(/[?&]callbackURL=/);

    const token = extractResetToken(reset.data.resetLink);
    expect(token).toBeTruthy();

    // Drive the reset directly via the BA api (the OA façade just forwards
    // newPassword + token from req.query to auth.api.resetPassword).
    const resetRes = await services.auth.api.resetPassword({
      body: { newPassword, token },
    });
    expect(resetRes?.status).toBe(true);

    // The credential account row now stores the argon2id hash.
    const after = await getCredentialAccount(
      services.knex,
      user.id,
      testConfig.schemas,
    );
    expect(after).toBeTruthy();
    expect(after.password.startsWith('$argon2id$')).toBe(true);

    // Old password no longer signs in.
    await expect(
      services.auth.api.signInEmail({
        body: { email, password: oldPassword },
      }),
    ).rejects.toBeTruthy();

    // New password signs in cleanly.
    const ok = await services.auth.api.signInEmail({
      body: { email, password: newPassword },
    });
    expect(ok?.user?.email).toBe(email);
  });

  it('reset on a non-activated user flips is_activated and runs runOnActivation', async () => {
    const email = 'reset-25-inactive@oa.test';
    const oldPassword = 'plainPwd-25-inactive-old';
    const newPassword = 'plainPwd-25-inactive-new';

    const user = await usersSvc.create(
      {
        fullName: 'Reset Inactive',
        email,
        password: oldPassword,
        isActivated: false,
      },
      { internal: true, detailed: true },
    );

    expect(!!user.isActivated).toBe(false);

    // Drain mails captured during users.create (the after-hook fires a
    // verification email — we want only the reset-password mail below).
    sentMails.length = 0;

    await request(app)
      .post('/api/auth/request-password-reset')
      .set('Content-Type', 'application/json')
      .send({ email });

    const reset = await waitFor(
      () => sentMails.find((m) => m.template === 'resetPassword'),
      { message: 'resetPassword mail to be sent' },
    );
    const token = extractResetToken(reset.data.resetLink);

    const out = await services.auth.api.resetPassword({
      body: { newPassword, token },
    });
    expect(out?.status).toBe(true);

    // The hooks.after on /reset-password (packages/auth/src/index.js) flips
    // emailVerified=true on a previously-inactive user and invokes
    // onEmailVerified, which calls runOnActivation.
    const refreshed = await services
      .knex(testConfig.schemas.user)
      .where({ id: user.id })
      .first();
    expect(refreshed.is_activated).toBe(1);

    // runOnActivation creates the Inbox fire-and-forget (.then(noop)), so it can
    // land after resetPassword resolves — poll rather than read once.
    const inbox = await waitFor(
      async () => {
        const i = await new services.inboxes.Inbox({
          type: 'user',
          identifier: user.uid,
        })._get();
        return i.data ? i : null;
      },
      { message: 'user inbox to be created by runOnActivation' },
    );
    expect(inbox.data).toBeTruthy();
  });
});
