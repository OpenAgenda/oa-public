import request from 'supertest';
import Services from '../services/init.js';
import Core from '../core/index.js';
import generalFront from '../general/front.js';
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
  'superadmin',
];

describe('29 - superadmin sign-as (better-auth admin-style impersonation)', () => {
  let core;
  let services;
  let usersSvc;
  let app;
  let superadmin;
  const superPassword = 'SuperAdminPwd-29';
  // The superadmin uid is unknown until the user is created, but
  // `allowSuperAdmin` (services/users/middleware/allowSuperAdmin.js) reads
  // `core.getConfig().superAdminUids` at request time AND
  // `services/users/hooks/index.js#isSuperAdmin` reads from the same config
  // object by reference. We therefore mutate the array IN PLACE after the
  // user is created — both call sites observe the update.
  const superAdminUidsRef = [];
  const liveConfig = testConfig.extendWith({
    superAdminUids: superAdminUidsRef,
  });

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: [],
    });
  });

  beforeAll(async () => {
    services = await Services(liveConfig, { enabled });
    core = Core(services, liveConfig);
    usersSvc = services.users;

    superadmin = await usersSvc.create(
      {
        fullName: 'Super Admin 29',
        email: 'super-29@oa.test',
        password: superPassword,
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    // In-place push so both `core.getConfig().superAdminUids` and the
    // hook-captured reference observe the change without needing a service
    // re-init.
    superAdminUidsRef.push(Number(superadmin.uid));

    app = buildApp(services, liveConfig, {
      extend: (a) => {
        generalFront(a);
        // Mount the superadmin routes (production: server.js calls
        // app.services.superadmin.plugApp(app, '/admin')).
        services.superadmin.plugApp(a, '/admin');
        // Test-only `/whoami` to read req.user identity after sign-as.
        a.get('/whoami', (req, res) =>
          res.json({
            user: req.user
              ? {
                id: req.user.id,
                uid: String(req.user.uid),
                email: req.user.email,
              }
              : null,
          }));
      },
    });
  });

  beforeEach(() => flushRateLimit(services.redis));

  afterAll(() => core.services.shutdown({ clear: true }));

  it('superadmin can impersonate a target user, and /signout restores the superadmin session', async () => {
    const targetEmail = 'target-29@oa.test';
    const target = await usersSvc.create(
      {
        fullName: 'Target 29',
        email: targetEmail,
        password: 'TargetPwd-29',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);

    // 1) Sign in as the superadmin via the better-auth /signin handler.
    const signinRes = await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email: superadmin.email, password: superPassword });
    expect(signinRes.status).toBe(200);
    expect(signinRes.body?.user?.email).toBe(superadmin.email);

    const whoamiSuper = await agent.get('/whoami');
    expect(whoamiSuper.body.user?.uid).toBe(String(superadmin.uid));

    // 2) Hit the superadmin sign-as route with the target's uid.
    const signAsRes = await agent
      .get(`/admin/users/signin?uid=${target.uid}`)
      .redirects(0);
    expect(signAsRes.status).toBe(302);
    expect(signAsRes.headers.location).toBe('/home');

    // The response must Set-Cookie a fresh oa.session_token (impersonated
    // user) AND a BA-signed oa.admin_session marker carrying the
    // impersonator's session token.
    const setCookies = []
      .concat(signAsRes.headers['set-cookie'] || [])
      .join(';');
    expect(setCookies).toMatch(/oa\.session_token=/);
    expect(setCookies).toMatch(/oa\.admin_session=/);

    // 3) Subsequent requests through the same agent must resolve as the
    //    target user, not the superadmin.
    const whoamiTarget = await agent.get('/whoami');
    expect(whoamiTarget.body.user?.id).toBe(target.id);
    expect(whoamiTarget.body.user?.email).toBe(targetEmail);
    expect(whoamiTarget.body.user?.uid).toBe(String(target.uid));

    // 4) /signout in the impersonated state must restore the superadmin's
    //    BA session and clear the admin_session marker cookie. We assert by
    //    following the redirect (302 to /admin/users — superadmin-restored
    //    path).
    const signoutRes = await agent.get('/signout').redirects(0);
    expect(signoutRes.status).toBe(302);
    expect(signoutRes.headers.location).toBe('/');

    // The admin_session marker cookie must be expired (Max-Age=0).
    const signoutSetCookies = []
      .concat(signoutRes.headers['set-cookie'] || [])
      .join(';');
    expect(signoutSetCookies).toMatch(/oa\.admin_session=;\s*Max-Age=0/i);

    // 5) After /signout, req.user is the superadmin again.
    const whoamiBack = await agent.get('/whoami');
    expect(whoamiBack.body.user?.id).toBe(superadmin.id);
    expect(whoamiBack.body.user?.uid).toBe(String(superadmin.uid));
  });

  it('rejects the sign-as route when the caller is not a superadmin', async () => {
    const planeEmail = 'plane-29@oa.test';
    const plane = await usersSvc.create(
      {
        fullName: 'Plane 29',
        email: planeEmail,
        password: 'PlanePwd-29',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);
    await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email: planeEmail, password: 'PlanePwd-29' });

    const target = await usersSvc.create(
      {
        fullName: 'Target Refused 29',
        email: 'target-refused-29@oa.test',
        password: 'TargetPwd-29',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const res = await agent
      .get(`/admin/users/signin?uid=${target.uid}`)
      .redirects(0);
    // allowSuperAdmin redirects non-superadmins to '/' instead of opening
    // an impersonation session.
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');

    // Make sure no admin_session marker cookie was set.
    const setCookies = [].concat(res.headers['set-cookie'] || []).join(';');
    expect(setCookies).not.toMatch(/oa\.admin_session=/);

    // And req.user is still `plane`, not the target.
    const whoami = await agent.get('/whoami');
    expect(whoami.body.user?.id).toBe(plane.id);
  });

  it('when stopImpersonating fails, /signout falls through to a clean signout', async () => {
    const targetEmail = 'target-29-recover@oa.test';
    const target = await usersSvc.create(
      {
        fullName: 'Target Recovery 29',
        email: targetEmail,
        password: 'TargetPwd-29-rec',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agent = request.agent(app);

    // 1) Sign in as the superadmin.
    const signinRes = await agent
      .post('/api/auth/sign-in/email')
      .set('Content-Type', 'application/json')
      .send({ email: superadmin.email, password: superPassword });
    expect(signinRes.status).toBe(200);

    // 2) Sign as the target — populates oa.session_token (target) and
    //    oa.admin_session (impersonator-token) cookies on the agent jar.
    const signAsRes = await agent
      .get(`/admin/users/signin?uid=${target.uid}`)
      .redirects(0);
    expect(signAsRes.status).toBe(302);

    // 3) Force `auth.stopImpersonating` to throw on the next call only —
    //    this is the failure mode where BA can't restore the impersonator
    //    session at /signout (e.g. the admin_session marker was tampered
    //    with, the impersonator session was revoked, etc.).
    const realStop = services.auth.stopImpersonating;
    services.auth.stopImpersonating = async () => {
      throw new Error('mocked stopImpersonating failure');
    };

    let signoutRes;
    try {
      signoutRes = await agent.get('/signout').redirects(0);
    } finally {
      services.auth.stopImpersonating = realStop;
    }

    // 4) Recovery: fall through to the regular signout chain — close the
    //    impersonated BA session and redirect to '/'. The admin_session
    //    cookie is left as-is (next /signout from a fresh login will
    //    overwrite it via setSignedCookie); the impersonated session
    //    cookie is expired by BA's signOut.
    expect(signoutRes.status).toBe(302);
    expect(signoutRes.headers.location).toBe('/');

    // The impersonated session_token must be expired (BA's signOut emits
    // a Max-Age=0 / empty-value Set-Cookie).
    const setCookieList = [].concat(signoutRes.headers['set-cookie'] || []);
    const sessionCookies = setCookieList.filter((c) =>
      /^oa\.session_token=/.test(c));
    expect(sessionCookies.length).toBeGreaterThan(0);
    for (const cookie of sessionCookies) {
      const isExpiration = /^oa\.session_token=;/.test(cookie)
        || /max-age=0/i.test(cookie)
        || /expires=thu,\s*0?1\s*jan\s*1970/i.test(cookie);
      expect(isExpiration).toBe(true);
    }
  });

  it('auth.api.impersonateUser rejects with 401 when called without a session', async () => {
    const target = await usersSvc.create(
      {
        fullName: 'Target Unauth 29',
        email: 'target-unauth-29@oa.test',
        password: 'TargetPwd-29-u',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    // No `headers` => no session cookie => UNAUTHORIZED.
    await expect(
      services.auth.api.impersonateUser({
        body: { userId: String(target.id) },
        headers: new Headers(),
        asResponse: false,
      }),
    ).rejects.toThrow();
  });

  // The oa-impersonation BA plugin mounts server-only endpoints at
  // /api/auth/oa/*. These must NOT be reachable from the public Express
  // router — they would let any caller open a session as any user (or
  // forcibly impersonate). The deny middleware is registered in buildApp.js
  // (and server.js for production) before the BA `nodeHandler`.
  it('rejects public POST to /api/auth/oa/* with 404', async () => {
    const target = await usersSvc.create(
      {
        fullName: 'Public Endpoint Target',
        email: 'public-endpoint-target-29@oa.test',
        password: 'PubPwd-29',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const openRes = await request(app)
      .post('/api/auth/oa/open-session')
      .set('Accept', 'application/json')
      .send({ userId: String(target.id) });
    expect(openRes.status).toBe(404);
    const openSetCookies = []
      .concat(openRes.headers['set-cookie'] || [])
      .join(';');
    expect(openSetCookies).not.toMatch(/oa\.session_token/);

    const impersonateRes = await request(app)
      .post('/api/auth/oa/impersonate-user')
      .set('Accept', 'application/json')
      .send({ userId: String(target.id) });
    expect(impersonateRes.status).toBe(404);

    const stopRes = await request(app)
      .post('/api/auth/oa/stop-impersonating')
      .set('Accept', 'application/json');
    expect(stopRes.status).toBe(404);

    // GET should also be denied.
    const resGet = await request(app).get('/api/auth/oa/open-session');
    expect(resGet.status).toBe(404);
  });
});
