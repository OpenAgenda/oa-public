import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import generalFront from '../general/front.js';
import {
  ifLogged,
  ifUnlogged,
  requireUser,
  requireUserJson,
} from '../lib/authGuards.js';
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

function extendApp(_services) {
  return (app) => {
    generalFront(app);

    app.get('/whoami', (req, res) =>
      res.json({
        user: req.user
          ? {
            id: req.user.id,
            uid: String(req.user.uid),
            email: req.user.email,
            name: req.user.name,
            culture: req.user.culture,
            transverseApiAccess: req.user.transverseApiAccess,
            isNew: req.user.isNew,
          }
          : null,
      }));

    // Mimic the /home gating pattern: ifUnlogged → redirect; otherwise serve.
    app.get(
      '/protected',
      ifUnlogged((_req, res) => res.redirect(302, '/')),
      (_req, res) => res.json({ ok: true }),
    );
    app.get(
      '/loggedonly',
      ifLogged((req, res) => res.json({ uid: String(req.user.uid) })),
      (_req, res) => res.json({ ok: false }),
    );
    // requireUser: serves when a session is present, otherwise issues the
    // unauth redirect to `…/signin`. Used to prove a revoked session (no BA
    // session at all) is distinct from the legacy blacklist-flash redirect to `/`.
    app.get('/needs-auth', requireUser, (_req, res) => res.json({ ok: true }));
    // requireUserJson: the XHR/API variant — when unauthenticated it answers
    // 401 JSON (a redirect would be useless to a fetch client) instead of the
    // signin redirect that requireUser issues.
    app.get('/needs-auth-json', requireUserJson, (_req, res) =>
      res.json({ ok: true }));
  };
}

describe('21 - sessions loader (better-auth)', () => {
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
    app = buildApp(services, testConfig, { extend: extendApp(services) });
  });

  beforeEach(() => flushRateLimit(services.redis));

  afterAll(() => core.services.shutdown({ clear: true }));

  it('returns null user when no cookie is present', async () => {
    const res = await request(app).get('/whoami');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  it('loads req.user from a fresh better-auth session cookie', async () => {
    const email = 'hybrid-ba@oa.test';
    const password = 'plainPwd-21';
    await usersSvc.create(
      { fullName: 'Hybrid BA', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    const res = await agent.get('/whoami');
    expect(res.status).toBe(200);
    expect(res.body.user?.email).toBe(email);
  });

  it('clears req.user once the better-auth session is signed out', async () => {
    const email = 'hybrid-out@oa.test';
    const password = 'plainPwd-21-out';
    await usersSvc.create(
      { fullName: 'Hybrid Out', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });
    await agent.get('/signout');

    const res = await agent.get('/whoami');
    expect(res.body.user).toBeNull();
  });

  it('mw.ifUnlogged does not redirect when a better-auth session is loaded', async () => {
    const email = 'hybrid-gate-ok@oa.test';
    const password = 'plainPwd-21-gate';
    await usersSvc.create(
      { fullName: 'Hybrid Gate OK', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    const res = await agent.get('/protected');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('mw.ifUnlogged redirects when no session is present', async () => {
    const res = await request(app).get('/protected').redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });

  it('mw.ifLogged invokes the handler when a better-auth session is loaded', async () => {
    const email = 'hybrid-iflogged@oa.test';
    const password = 'plainPwd-21-il';
    const user = await usersSvc.create(
      { fullName: 'Hybrid Iflogged', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    const res = await agent.get('/loggedonly');
    expect(res.status).toBe(200);
    expect(res.body.uid).toBe(String(user.uid));
  });

  it('mw.ifLogged falls through when no session is present', async () => {
    const res = await request(app).get('/loggedonly');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: false });
  });

  it('mw.requireUserJson answers 401 JSON when no session is present', async () => {
    const res = await request(app).get('/needs-auth-json');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Not logged' });
  });

  it('mw.requireUserJson passes through when a better-auth session is loaded', async () => {
    const email = 'hybrid-json@oa.test';
    const password = 'plainPwd-21-json';
    await usersSvc.create(
      { fullName: 'Hybrid Json', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    const res = await agent.get('/needs-auth-json');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('clears the session (signin redirect) once a user is blacklisted via the users service', async () => {
    const email = 'hybrid-bl@oa.test';
    const password = 'plainPwd-21-bl';
    const user = await usersSvc.create(
      { fullName: 'Hybrid Bl', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    // Real application path: an internal patch of `isBlacklisted` false→true
    // fires accountCleanup's `afterPatchBlacklist` → `revokeUserSessions`,
    // which deletes the Redis session record.
    await usersSvc.patch(user.uid, { isBlacklisted: true }, { internal: true });

    // The session is gone: getSession (disableCookieCache) returns null, so
    // requireUser issues the unauth redirect to `…/signin`. This is the
    // proof of revocation — distinct from the legacy blacklist-flash redirect
    // to `/` (which would require a still-readable session). The signin
    // redirect only happens when there is no session at all.
    const res = await agent.get('/needs-auth').redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^\/signin\?/);

    // And an authenticated read sees no user at all (session revoked).
    const who = await agent.get('/whoami');
    expect(who.body.user).toBeNull();
  });

  it('refreshes the Redis session snapshot when a mirrored field is patched', async () => {
    const email = 'hybrid-refresh@oa.test';
    const password = 'plainPwd-21-refresh';
    const user = await usersSvc.create(
      {
        fullName: 'Hybrid Refresh',
        email,
        password,
        isActivated: true,
        culture: 'fr',
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    // Snapshot frozen at session creation: culture=fr, transverseApiAccess=false.
    const before = await agent.get('/whoami');
    expect(before.body.user.culture).toBe('fr');
    expect(before.body.user.transverseApiAccess).toBe(false);
    expect(before.body.user.name).toBe('Hybrid Refresh');

    // Out-of-band patch of session-mirrored fields through the users service.
    // accountCleanup's `afterPatchRefreshSession` → `refreshUserSessions`
    // re-snapshots the fresh user row into the active Redis session WITHOUT
    // signing the user out.
    await usersSvc.patch(
      user.uid,
      { culture: 'en', transverseApiAccess: true, fullName: 'Hybrid Renamed' },
      { internal: true },
    );

    const after = await agent.get('/whoami');
    // The new values are visible on req.user...
    expect(after.body.user.culture).toBe('en');
    expect(after.body.user.transverseApiAccess).toBe(true);
    expect(after.body.user.name).toBe('Hybrid Renamed');
    // ...and the rest of the BA shape is intact (the refresh re-snapshotted the
    // FULL user, not a truncated/partial row): identity + uid + isNew survive.
    expect(after.body.user.email).toBe(email);
    expect(after.body.user.uid).toBe(String(user.uid));
    expect(after.body.user.id).toBe(user.id);
    expect(after.body.user.isNew).toBe(before.body.user.isNew);
    expect(after.body.user.isNew).not.toBeUndefined();
  });

  it('refreshes the snapshot on a non-internal patch (the self-service path)', async () => {
    const email = 'hybrid-refresh-ni@oa.test';
    const password = 'plainPwd-21-ni';
    const user = await usersSvc.create(
      {
        fullName: 'NI Refresh',
        email,
        password,
        isActivated: true,
        culture: 'fr',
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    expect((await agent.get('/whoami')).body.user.culture).toBe('fr');

    // Non-internal patch (internal !== true) of a mirrored field — the branch a
    // user self-service profile edit takes. afterPatchRefreshSession must fire
    // here too, not only for internal admin patches (this is exactly what
    // dropping the `internal` guard enables). No `params.user` is passed so the
    // announcement after-hook is skipped (the test app omits the supervisor
    // service); the refresh hook needs only `before`, stashed unconditionally.
    await usersSvc.patch(user.uid, { culture: 'en' }, {});

    expect((await agent.get('/whoami')).body.user.culture).toBe('en');
  });
});
