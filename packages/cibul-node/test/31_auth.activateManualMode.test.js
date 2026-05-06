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

// Coverage for auth/local.front.js manual mode branch: when redis flag
// `accountActivationMode === 'manual'`, GET /activate/:token must NOT
// consume the BA verification token nor open a session — it renders a
// manual-activation page instead.
describe('31 - /activate/:token in manual activation mode (phase 3b)', () => {
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
    // Default OA behaviour for activation mode in tests is non-manual; this
    // suite forces 'manual' and other suites already restore 'auto'.
    await services.redis.set('accountActivationMode', 'manual');
  });

  afterAll(async () => {
    services.mails.send = originalSend;
    await services.redis.set('accountActivationMode', 'auto');
    await core.services.shutdown({ clear: true });
  });

  it('renders the manual page and leaves the user not activated', async () => {
    const email = 'manual-mode-31@oa.test';

    const user = await usersSvc.create(
      {
        fullName: 'Manual Mode',
        email,
        password: 'plainPwd-31-manual',
        isActivated: false,
      },
      { internal: true, detailed: true },
    );

    const res = await request(app).get('/activate/manual-mode-31-some-token');

    // Manual mode renders a 200 HTML page — never a 302 redirect.
    expect(res.status).toBe(200);
    expect(res.headers.location).toBeUndefined();

    // The rendered page is the manual.tpl template — assert against a
    // stable substring from @openagenda/labels/auth/manual.js. The lang
    // defaults to 'fr' in buildApp, so `verif@openagenda.com` is the
    // safest stable marker (present in every locale of `complaint`).
    expect(res.text).toContain('verif@openagenda.com');

    // No session cookie must be set — manual mode is explicitly the
    // "do not consume the token, do not sign in" branch.
    const setCookies = [].concat(res.headers['set-cookie'] || []);
    const sessionCookies = setCookies.filter((c) =>
      /oa\.session_token=/.test(c));
    expect(sessionCookies).toEqual([]);

    // User must remain not-activated.
    const refreshed = await services
      .knex(testConfig.schemas.user)
      .where({ id: user.id })
      .first();
    expect(refreshed.is_activated).toBe(0);
  });

  it('still renders the manual page when the URL token does not match any row', async () => {
    const res = await request(app).get(
      '/activate/manual-mode-31-no-such-token',
    );

    expect(res.status).toBe(200);
    expect(res.headers.location).toBeUndefined();
    expect(res.text).toContain('verif@openagenda.com');

    const setCookies = [].concat(res.headers['set-cookie'] || []);
    const sessionCookies = setCookies.filter((c) =>
      /oa\.session_token=/.test(c));
    expect(sessionCookies).toEqual([]);
  });
});
