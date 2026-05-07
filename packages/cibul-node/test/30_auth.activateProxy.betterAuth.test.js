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

// Phase 6 lot 5 — `/activate/:token` is now a pure 302 proxy to BA's
// `/api/auth/verify-email`. This suite asserts the proxy contract: the
// redirect target is `/api/auth/verify-email?token=…&callbackURL=…` with the
// callbackURL pointing at `/post-activate` (the single landing page that
// surfaces both BA's success path and BA's `?error=<CODE>` redirects).
//
// The actual end-to-end verify flow (BA → Set-Cookie → 302 → /post-activate)
// is covered by:
//   - 22_auth.emailVerification.betterAuth.test.js (BA verifyEmail mechanics)
//   - 28_auth.postActivate.invitation.test.js (post-activate semantics)
describe('30 - /activate/:token is a 302 proxy to BA verifyEmail', () => {
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
    app = buildApp(services, testConfig, {
      extend: (a) => {
        localFront(a);
      },
    });

    originalSend = services.mails.send.bind(services.mails);
    services.mails.send = async () => ({ status: true });
  });

  beforeEach(async () => {
    await services.redis.set('accountActivationMode', 'auto');
  });

  afterAll(async () => {
    services.mails.send = originalSend;
    await core.services.shutdown({ clear: true });
  });

  it('redirects bare /activate/:token to /api/auth/verify-email with callbackURL=/post-activate?next=/home', async () => {
    const res = await request(app).get('/activate/sometoken');

    expect(res.status).toBe(302);
    const url = new URL(res.headers.location, 'http://x.test');
    expect(url.pathname).toBe('/api/auth/verify-email');
    expect(url.searchParams.get('token')).toBe('sometoken');
    const callbackURL = url.searchParams.get('callbackURL');
    expect(callbackURL).toBeTruthy();
    // callbackURL is a path-only relative URL; parse it against an arbitrary
    // base so URLSearchParams works.
    const cb = new URL(callbackURL, 'http://x.test');
    expect(cb.pathname).toBe('/post-activate');
    expect(cb.searchParams.get('next')).toBe('/home');
  });

  it('forwards the invitation query param into the callbackURL', async () => {
    const res = await request(app).get(
      '/activate/sometoken?invitation=INV-30-1',
    );

    expect(res.status).toBe(302);
    const url = new URL(res.headers.location, 'http://x.test');
    const callbackURL = url.searchParams.get('callbackURL');
    const cb = new URL(callbackURL, 'http://x.test');
    expect(cb.pathname).toBe('/post-activate');
    expect(cb.searchParams.get('invitation')).toBe('INV-30-1');
  });

  it('hoists the agenda slug from the path into the callbackURL', async () => {
    // `/:agendaSlug/activate/:token` runs `agendas.mw.load` which 404s on
    // unknown slugs. Build a minimal agenda fixture using the canonical
    // `core.agendas.create` factory (mirrors test 28).
    const admin = await usersSvc.create(
      {
        fullName: 'Activate Proxy Admin',
        email: 'activate-proxy-30-admin@oa.test',
        password: 'plainPwd-30-admin',
        isActivated: true,
      },
      { internal: true, detailed: true },
    );

    const agenda = await core.agendas.create(
      {
        title: 'Activate proxy test agenda',
        description: 'agenda used by 30 proxy tests',
      },
      { userUid: admin.uid },
    );

    const res = await request(app).get(`/${agenda.slug}/activate/sometoken`);

    expect(res.status).toBe(302);
    const url = new URL(res.headers.location, 'http://x.test');
    expect(url.pathname).toBe('/api/auth/verify-email');
    const callbackURL = url.searchParams.get('callbackURL');
    const cb = new URL(callbackURL, 'http://x.test');
    expect(cb.pathname).toBe('/post-activate');
    expect(cb.searchParams.get('agenda')).toBe(agenda.slug);
    expect(cb.searchParams.get('next')).toBe(`/${agenda.slug}/contribute`);
  });

  it('does NOT emit a session cookie (proxy does not consume the token itself)', async () => {
    const res = await request(app).get('/activate/sometoken');

    expect(res.status).toBe(302);
    const setCookies = [].concat(res.headers['set-cookie'] || []);
    const sessionCookies = setCookies.filter((c) =>
      /oa\.session_token=/.test(c));
    expect(sessionCookies).toEqual([]);
  });

  it('/post-activate intercepts BA `?error=` and redirects to /auth/signin?msg=invalidActivation', async () => {
    const res = await request(app).get(
      '/post-activate?error=INVALID_TOKEN&next=/home',
    );

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/auth/signin?msg=invalidActivation');
  });

  it('/post-activate redirects to the agenda page when error+agenda are both present', async () => {
    // Phase 6 lot 6 — when an agenda slug is carried through the verifyEmail
    // callbackURL, surface the invalidActivation banner inside the
    // agenda-show page (`/{slug}?auth=signin&msg=invalidActivation`) rather
    // than on the neutral `/auth/signin` page. The agenda-show page mounts
    // <InvitationAuthDialog> which boots AuthDialog with the banner.
    const res = await request(app).get(
      '/post-activate?error=TOKEN_EXPIRED&agenda=lyon&next=/lyon/contribute',
    );

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      '/lyon?auth=signin&msg=invalidActivation',
    );
  });
});
