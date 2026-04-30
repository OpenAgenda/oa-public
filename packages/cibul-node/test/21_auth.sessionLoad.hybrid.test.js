import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
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

function extendApp(services) {
  return (app) => {
    app.get('/whoami', (req, res) =>
      res.json({
        user: req.user
          ? {
            id: req.user.id,
            uid: String(req.user.uid),
            email: req.user.email,
          }
          : null,
      }));

    // Mimic the /home gating pattern: ifUnlogged → redirect; otherwise serve.
    app.get(
      '/protected',
      services.sessions.mw.ifUnlogged((_req, res) => res.redirect(302, '/')),
      (_req, res) => res.json({ ok: true }),
    );
    app.get(
      '/loggedonly',
      services.sessions.mw.ifLogged((req, res) =>
        res.json({ uid: String(req.user.uid) })),
      (_req, res) => res.json({ ok: false }),
    );

    // Test-only: open a real legacy cookie-session for the given uid, mirroring
    // pre-phase-3 sign-in behaviour. The cookie-session middleware writes the
    // signed `oa` cookie on the response; subsequent requests with the same
    // supertest agent replay it through the hybrid loader's legacy fallback.
    app.get('/test-legacy-signin/:uid', (req, res, next) => {
      services.sessions.open(req, res, { uid: req.params.uid }, (err) => {
        if (err) return next(err);
        res.json({ ok: true });
      });
    });
  };
}

describe('21 - sessions hybrid loader (better-auth + cookie-session)', () => {
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
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
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
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
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
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
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
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
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

  it('redirects + clears session for a blacklisted user with a better-auth cookie', async () => {
    const email = 'hybrid-bl@oa.test';
    const password = 'plainPwd-21-bl';
    const user = await usersSvc.create(
      { fullName: 'Hybrid Bl', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/signin')
      .set('Accept', 'application/json')
      .type('form')
      .send({ email, password });

    await services
      .knex(testConfig.schemas.user)
      .where({ id: user.id })
      .update({ is_blacklisted: 1 });

    const res = await agent.get('/whoami').redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });

  // Hybrid fallback: a request that carries a legacy cookie-session (signed
  // `oa` cookie, as written before phase 3 deploy) but no better-auth cookie
  // must still resolve req.user via the legacy path. We open a real legacy
  // session via a test-only route so the cookie-session middleware emits a
  // properly signed cookie that supertest replays on subsequent requests.
  it('falls back to the legacy cookie-session when no better-auth cookie is present', async () => {
    const email = 'hybrid-fallback@oa.test';
    const password = 'plainPwd-21-fallback';
    const user = await usersSvc.create(
      { fullName: 'Hybrid Fallback', email, password, isActivated: true },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    const openRes = await agent.get(`/test-legacy-signin/${user.uid}`);
    expect(openRes.body).toEqual({ ok: true });

    const res = await agent.get('/whoami');
    expect(res.status).toBe(200);
    expect(res.body.user?.uid).toBe(String(user.uid));
    expect(res.body.user?.email).toBe(email);
  });
});
