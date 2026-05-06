import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import localFront from '../auth/local.front.js';
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

describe('28 - /post-activate applies invitation token after BA auto-signin', () => {
  let core;
  let services;
  let usersSvc;
  let app;
  let originalSend;
  let sentMails;

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
    app = buildApp(services, testConfig, {
      extend: (a) => {
        localFront(a);
      },
    });

    // Don't actually send mail in tests — invitations created via members
    // create flow trigger an invitation mail. We capture the args so the
    // suite below can assert the generated invitation URL shape.
    originalSend = services.mails.send.bind(services.mails);
    sentMails = [];
    services.mails.send = async (options) => {
      sentMails.push(options);
      return { status: true };
    };
  });

  beforeEach(() => {
    sentMails.length = 0;
  });

  beforeEach(() => flushRateLimit(services.redis));

  afterAll(async () => {
    services.mails.send = originalSend;
    await core.services.shutdown({ clear: true });
  });

  // Create an admin user, an agenda, and a member-invitation pair where the
  // invitation has a `linkMember` action targeting the new agenda. Returns
  // both the invitation token (for the activation URL) and the agenda
  // (for redirect assertions).
  //
  // By default the underlying `members.create` runs with `context.silent`
  // so the invitation mail is not dispatched (other suite cases don't need
  // it). Pass `{ silent: false }` to opt in to the real `sendInvitation`
  // path and capture the mail in `sentMails`.
  async function buildInvitationFixture({
    adminEmail,
    inviteeEmail,
    silent = true,
  }) {
    const admin = await usersSvc.create(
      {
        fullName: 'Admin User',
        email: adminEmail,
        password: 'plainPwd-28-admin',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agenda = await core.agendas.create(
      {
        title: 'Post-activate test agenda',
        description: 'agenda used by 28 invitation tests',
      },
      { userUid: admin.uid },
    );

    // Create a member with only an email (no userUid) — this triggers the
    // `_memberIsInvitedNonUser` branch in services/members/onCreate which
    // creates an invitation with a `linkMember` action via
    // services.invitations.assign.
    await core.agendas(agenda.uid).members.create(
      null,
      'contributor',
      {
        name: 'Pending Invite',
        email: inviteeEmail,
      },
      {
        userUid: admin.uid,
        context: { silent },
      },
    );

    const { invitation } = await services.invitations.get(
      { email: inviteeEmail },
      { includeProcessed: true },
    );

    return { admin, agenda, invitation };
  }

  it('member invitation mail links to /auth/signup (not the legacy /{slug}/signup)', async () => {
    // Phase 6 lot 2 — the legacy `/{agendaSlug}/signup` Express handler was
    // retired, so the invitation mail must point at the App Router signup
    // page. The Next proxy handles the no-locale → /:locale/auth/signup hop;
    // this test only asserts the path/query shape produced by the cibul-node
    // mailer (services/members/lib/mail.js).
    const inviteeEmail = 'postactivate-mail-link@oa.test';

    const { agenda, invitation } = await buildInvitationFixture({
      adminEmail: 'postactivate-mail-admin@oa.test',
      inviteeEmail,
      // Opt out of the silent flag so onCreate dispatches the invitation
      // mail through services.members/lib/mail.sendInvitation. The captured
      // payload is what the rest of the assertions inspect.
      silent: false,
    });
    expect(invitation?.token).toBeTruthy();

    const invitationMail = sentMails.find(
      (m) => m.template === 'memberInvitation',
    );
    expect(invitationMail).toBeTruthy();

    const { link } = invitationMail.data;
    expect(typeof link).toBe('string');

    // Path must be /auth/signup (Next App Router), not /{slug}/signup.
    const url = new URL(link);
    expect(url.pathname).toBe('/auth/signup');
    expect(url.pathname).not.toMatch(new RegExp(`^/${agenda.slug}/signup`));

    // Query carries the bits the Next signup page reads: invitation token,
    // pre-filled email, locale, and a base64 redirect that lands the user
    // on the agenda's contribute page after activation.
    expect(url.searchParams.get('invitation')).toBe(invitation.token);
    expect(url.searchParams.get('email')).toBe(inviteeEmail);
    expect(url.searchParams.get('lang')).toBeTruthy();
    const encodedRedirect = url.searchParams.get('redirect');
    expect(encodedRedirect).toBeTruthy();
    const decodedRedirect = Buffer.from(encodedRedirect, 'base64').toString();
    expect(decodedRedirect).toBe(`/${agenda.slug}/contribute`);
  });

  it('applies linkMember invitation and redirects to /{slug}/contribute', async () => {
    const inviteeEmail = 'postactivate-link@oa.test';
    const inviteePassword = 'plainPwd-28-link';

    const { agenda, invitation } = await buildInvitationFixture({
      adminEmail: 'postactivate-admin-link@oa.test',
      inviteeEmail,
    });
    expect(invitation).toBeTruthy();
    expect(invitation.token).toBeTruthy();

    // Invitee user account, signed in directly so /post-activate sees a
    // logged-in req.user — this stand-ins for BA's auto-signin redirect.
    await usersSvc.create(
      {
        fullName: 'Invitee Link',
        email: inviteeEmail,
        password: inviteePassword,
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email: inviteeEmail, password: inviteePassword });

    const res = await agent.get(
      `/post-activate?invitation=${invitation.token}&next=/home`,
    );

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`/${agenda.slug}/contribute`);

    // Side-effect: invitations.execute → linkMember should have linked the
    // signed-in user to the member row.
    const invitee = await usersSvc.findOne({
      query: { email: inviteeEmail },
      detailed: true,
    });
    const member = await services.members.get({
      agendaUid: agenda.uid,
      userUid: invitee.uid,
    });
    expect(member).toBeTruthy();
    expect(member.userUid).toBe(invitee.uid);
  });

  it('redirects to next when no invitation token is provided', async () => {
    const email = 'postactivate-noinv@oa.test';
    const password = 'plainPwd-28-noinv';

    await usersSvc.create(
      {
        fullName: 'No Invitation',
        email,
        password,
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    const res = await agent.get('/post-activate?next=/home');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/home');
  });

  it('rejects malicious next values (open-redirect / CRLF / whitespace / backslash) and falls back to /home', async () => {
    const email = 'postactivate-malicious@oa.test';
    const password = 'plainPwd-28-mal';

    await usersSvc.create(
      {
        fullName: 'Malicious Next',
        email,
        password,
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    // Each variant exercises a separate branch of safeNext (auth/local.front.js):
    //   - protocol-relative URLs ("//host"),
    //   - absolute URLs ("https://host"),
    //   - whitespace + protocol-relative (tab, CRLF, plain space) — browsers
    //     historically tolerate these in Location headers,
    //   - backslash variants ("/\\…") that some browsers normalise to "//".
    const malicious = [
      '//evil.com/path',
      'https://evil.com/path',
      '/\t//evil.com',
      '/\r\n//evil.com',
      '/ //evil.com',
      '/\\evil.com',
      '/\\\\evil.com',
    ];

    for (const next of malicious) {
      const res = await agent.get(
        `/post-activate?next=${encodeURIComponent(next)}`,
      );
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/home');
    }
  });

  it('refuses to apply an invitation when the authenticated user is not the invitee', async () => {
    const inviteeEmail = 'postactivate-invitee@oa.test';
    const attackerEmail = 'postactivate-attacker@oa.test';
    const attackerPassword = 'plainPwd-28-attacker';

    const { agenda, invitation } = await buildInvitationFixture({
      adminEmail: 'postactivate-admin-hijack@oa.test',
      inviteeEmail,
    });
    expect(invitation?.token).toBeTruthy();
    // Sanity: invitation row carries the invitee's email.
    expect(invitation.email).toBe(inviteeEmail);

    // Attacker — authenticated, but NOT the invitee.
    const attacker = await usersSvc.create(
      {
        fullName: 'Attacker',
        email: attackerEmail,
        password: attackerPassword,
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email: attackerEmail, password: attackerPassword });

    const res = await agent.get(
      `/post-activate?invitation=${invitation.token}&next=/home`,
    );

    // The attacker must NOT be redirected to the contribute page; they
    // must NOT be linked to the agenda. The handler skips the apply
    // and falls back to the sanitized `next`.
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/home');

    // Attacker must not be a member of the invitee's agenda.
    let attackerMember = null;
    try {
      attackerMember = await services.members.get({
        agendaUid: agenda.uid,
        userUid: attacker.uid,
      });
    } catch (_err) {
      // Member lookups can throw when none exists — treated as "not a
      // member".
    }
    expect(attackerMember).toBeFalsy();

    // The invitation must still be pending (not consumed by the attacker).
    const after = await services.invitations.get(
      { email: inviteeEmail },
      { includeProcessed: true },
    );
    expect(after.invitation).toBeTruthy();
  });

  it('when not logged in, just redirects to next without applying invitation', async () => {
    const inviteeEmail = 'postactivate-anon@oa.test';

    const { invitation } = await buildInvitationFixture({
      adminEmail: 'postactivate-admin-anon@oa.test',
      inviteeEmail,
    });
    expect(invitation).toBeTruthy();

    const res = await request(app).get(
      `/post-activate?invitation=${invitation.token}&next=/home`,
    );

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/home');

    // Invitation must NOT have been processed (no logged-in user).
    const after = await services.invitations.get(
      { email: inviteeEmail },
      { includeProcessed: true },
    );
    expect(after.invitation).toBeTruthy();
  });
});
