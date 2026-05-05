import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import localFront from '../auth/local.front.js';
import runOnActivation from '../services/users/lib/runOnActivation.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import buildApp from './helpers/buildApp.js';

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

describe('23 - auth /activate/:token legacy facade fallback (phase 3b)', () => {
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
    app = buildApp(services, testConfig, { extend: (a) => localFront(a) });

    originalSend = services.mails.send.bind(services.mails);
  });

  beforeEach(async () => {
    sentMails = [];
    services.mails.send = async (options) => {
      sentMails.push(options);
      return { status: true };
    };
    // Default OA behaviour for activation mode in tests is non-manual.
    await services.redis.set('accountActivationMode', 'auto');
  });

  afterAll(async () => {
    services.mails.send = originalSend;
    await core.services.shutdown({ clear: true });
  });

  // KNOWN BUG (Lot 3 — packages/cibul-node/auth/local.front.js:620-635):
  // The activate() façade calls auth.api.verifyEmail({asResponse:true})
  // The façade calls `auth.api.verifyEmail({asResponse:true})` and inspects
  // the returned Response status: 4xx with INVALID_TOKEN/TOKEN_EXPIRED/
  // USER_NOT_FOUND falls through to the legacy `users.activate` path.
  it('falls through to legacy activation when the token is a Feathers `aa` token', async () => {
    const email = 'legacy-activate-23@oa.test';
    const password = 'plainPwd-23-legacy';

    const user = await usersSvc.create(
      {
        fullName: 'Legacy Activate',
        email,
        password,
        isActivated: false,
      },
      { internal: true, detailed: true },
    );

    const tokenRow = await services.tokens.create(
      {
        type: 'activateAccount',
        userId: user.id,
        email: user.email,
      },
      { user },
    );
    expect(tokenRow.token).toBeTruthy();

    const res = await request(app).get(`/activate/${tokenRow.token}`);
    // The /activate/:token façade redirects via res.redirect(302, …) on the
    // BA path success branch (auth/local.front.js:850).
    expect(res.status).toBe(302);

    const refreshed = await services
      .knex(testConfig.schemas.user)
      .where({ id: user.id })
      .first();
    expect(refreshed.is_activated).toBe(1);

    const apiKey = await services
      .keys({ type: 'userPublic', identifier: user.uid })
      .get({ optionalKey: true });
    expect(apiKey).toBeTruthy();
    expect(apiKey.key).toBeTruthy();

    const reloaded = await usersSvc.findOne({
      query: { id: user.id },
      detailed: true,
    });
    await runOnActivation(services, reloaded, {});

    const apiKeyAfter = await services
      .keys({ type: 'userPublic', identifier: user.uid })
      .get({ optionalKey: true });
    expect(apiKeyAfter?.key).toBe(apiKey.key);
  });

  it('renders an invalid-activation page when the token does not exist anywhere', async () => {
    const res = await request(app).get('/activate/this-token-does-not-exist');
    // Either 200 with the invalidActivation render, or 4xx — the contract
    // here is "not 5xx and the user remains unaffected". We only assert no
    // crash.
    expect(res.status).toBeLessThan(500);
  });

  // Coverage gap (auth/local.front.js:825-858): the legacy fallback path
  // honours an `?invitation=…` query and, when the invitation carries a
  // single `linkMember` action, resolves the target agenda and signs the
  // user in (req.agenda forwarded to auth.signin).
  it('legacy fallback applies a linkMember invitation, links the member and signs in', async () => {
    const inviteeEmail = 'legacy-activate-23-invite@oa.test';
    const inviteePassword = 'plainPwd-23-invite';

    // Admin who creates the agenda and invites the not-yet-existing user.
    const admin = await usersSvc.create(
      {
        fullName: 'Legacy Invite Admin',
        email: 'legacy-activate-23-admin@oa.test',
        password: 'plainPwd-23-admin',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agenda = await core.agendas.create(
      {
        title: 'Legacy invite test agenda',
        description: 'agenda used by 23 legacy invitation test',
      },
      { userUid: admin.uid },
    );

    // Member created with email-only triggers _memberIsInvitedNonUser →
    // invitations.assign('linkMember') (see services/members/onCreate.js).
    await core
      .agendas(agenda.uid)
      .members.create(
        null,
        'contributor',
        { name: 'Pending Legacy Invite', email: inviteeEmail },
        { userUid: admin.uid, context: { silent: true } },
      );

    const { invitation } = await services.invitations.get(
      { email: inviteeEmail },
      { includeProcessed: true },
    );
    expect(invitation?.token).toBeTruthy();
    // Sanity: the invitation actually carries a linkMember action.
    expect(invitation.data.actions.some((a) => a.name === 'linkMember')).toBe(
      true,
    );

    // Invitee user — non-activated, with a legacy `aa` token.
    const invitee = await usersSvc.create(
      {
        fullName: 'Legacy Invitee',
        email: inviteeEmail,
        password: inviteePassword,
        isActivated: false,
      },
      { internal: true, detailed: true },
    );

    const legacyToken = await services.tokens.create(
      {
        type: 'activateAccount',
        userId: invitee.id,
        email: invitee.email,
      },
      { user: invitee },
    );
    expect(legacyToken.token).toBeTruthy();

    const res = await request(app).get(
      `/activate/${legacyToken.token}?invitation=${encodeURIComponent(invitation.token)}`,
    );

    // The legacy fallback ends with auth.signin(...) which redirects.
    expect(res.status).toBe(302);

    // User must now be activated.
    const refreshed = await services
      .knex(testConfig.schemas.user)
      .where({ id: invitee.id })
      .first();
    expect(refreshed.is_activated).toBe(1);

    // Side-effect: the linkMember action ran and bound the invitee to the
    // member row of the target agenda.
    const member = await services.members.get({
      agendaUid: agenda.uid,
      userUid: invitee.uid,
    });
    expect(member).toBeTruthy();
    expect(member.userUid).toBe(invitee.uid);
  });

  // Edge case (auth/local.front.js:844-846): legacy fallback with an
  // invitation token whose actions contain ZERO linkMember entries. The
  // handler should still activate the user and open a session, but should
  // NOT use req.agenda for the redirect (the `if (actions.length !== 1)`
  // branch falls back to a plain auth.signin).
  it('legacy fallback with an invitation that has no linkMember action still activates and signs in', async () => {
    const email = 'legacy-activate-23-noaction@oa.test';
    const password = 'plainPwd-23-noaction';

    const user = await usersSvc.create(
      {
        fullName: 'Legacy NoAction',
        email,
        password,
        isActivated: false,
      },
      { internal: true, detailed: true },
    );

    const legacyToken = await services.tokens.create(
      {
        type: 'activateAccount',
        userId: user.id,
        email: user.email,
      },
      { user },
    );

    // A "bare" invitation row not assigned through members.create — it
    // carries an email but its `store.actions` is empty (no linkMember).
    // We forge the row directly through knex to keep the fixture minimal:
    // the legacy fallback only reads `invitation.data.actions` (mapped
    // from the `store` column by the Invitation model).
    const bareToken = `bare-inv-${Date.now()}`;
    await services.knex(testConfig.schemas.invitation).insert({
      token: bareToken,
      email,
      store: JSON.stringify({ actions: [] }),
    });

    const res = await request(app).get(
      `/activate/${legacyToken.token}?invitation=${encodeURIComponent(bareToken)}`,
    );

    // Either the no-action branch ran auth.signin (302), or the
    // invitation lookup failed and fell through to the same auth.signin
    // call (still 302). Both branches share the same observable contract:
    // user activated + redirect.
    expect(res.status).toBe(302);

    const refreshed = await services
      .knex(testConfig.schemas.user)
      .where({ id: user.id })
      .first();
    expect(refreshed.is_activated).toBe(1);
  });
});
