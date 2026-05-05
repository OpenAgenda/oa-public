import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import localFront from '../auth/local.front.js';
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

describe('28 - /post-activate applies invitation token after BA auto-signin', () => {
  let core;
  let services;
  let usersSvc;
  let app;
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

    // Don't actually send mail in tests — invitations created via members
    // create flow trigger an invitation mail.
    originalSend = services.mails.send.bind(services.mails);
    services.mails.send = async () => ({ status: true });
  });

  afterAll(async () => {
    services.mails.send = originalSend;
    await core.services.shutdown({ clear: true });
  });

  // Create an admin user, an agenda, and a member-invitation pair where the
  // invitation has a `linkMember` action targeting the new agenda. Returns
  // both the invitation token (for the activation URL) and the agenda
  // (for redirect assertions).
  async function buildInvitationFixture({ adminEmail, inviteeEmail }) {
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
        context: { silent: true },
      },
    );

    const { invitation } = await services.invitations.get(
      { email: inviteeEmail },
      { includeProcessed: true },
    );

    return { admin, agenda, invitation };
  }

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
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
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
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email, password });

    const res = await agent.get('/post-activate?next=/home');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/home');
  });

  it('rejects malicious next values and falls back to /home', async () => {
    const email = 'postactivate-mal@oa.test';
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
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email, password });

    // Protocol-relative URL.
    const protoRel = await agent.get(
      `/post-activate?next=${encodeURIComponent('//evil.com/path')}`,
    );
    expect(protoRel.status).toBe(302);
    expect(protoRel.headers.location).toBe('/home');

    // Absolute URL.
    const absolute = await agent.get(
      `/post-activate?next=${encodeURIComponent('https://evil.com/path')}`,
    );
    expect(absolute.status).toBe(302);
    expect(absolute.headers.location).toBe('/home');
  });

  it('rejects whitespace/backslash injections in next and falls back to /home', async () => {
    const email = 'postactivate-ws@oa.test';
    const password = 'plainPwd-28-ws';

    await usersSvc.create(
      {
        fullName: 'Whitespace Next',
        email,
        password,
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email, password });

    // Tab + protocol-relative.
    const tab = await agent.get(
      `/post-activate?next=${encodeURIComponent('/\t//evil.com')}`,
    );
    expect(tab.status).toBe(302);
    expect(tab.headers.location).toBe('/home');

    // CRLF + protocol-relative.
    const crlf = await agent.get(
      `/post-activate?next=${encodeURIComponent('/\r\n//evil.com')}`,
    );
    expect(crlf.status).toBe(302);
    expect(crlf.headers.location).toBe('/home');

    // Plain space + protocol-relative.
    const space = await agent.get(
      `/post-activate?next=${encodeURIComponent('/ //evil.com')}`,
    );
    expect(space.status).toBe(302);
    expect(space.headers.location).toBe('/home');

    // Single backslash variant.
    const bs = await agent.get(
      `/post-activate?next=${encodeURIComponent('/\\evil.com')}`,
    );
    expect(bs.status).toBe(302);
    expect(bs.headers.location).toBe('/home');

    // Double backslash (some browsers treat \\ as //).
    const bs2 = await agent.get(
      `/post-activate?next=${encodeURIComponent('/\\\\evil.com')}`,
    );
    expect(bs2.status).toBe(302);
    expect(bs2.headers.location).toBe('/home');
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
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
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
