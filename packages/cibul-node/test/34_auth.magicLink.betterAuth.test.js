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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Magic-link has no Express façade: the Next UI POSTs straight to BA's
// /api/auth/sign-in/magic-link (like sign-in/email). All OA branching lives in
// the onSendMagicLink callback (services/auth) which BA fires for every send.
describe('34 - auth magic-link via better-auth', () => {
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

  beforeEach(async () => {
    sentMails = [];
    services.mails.send = async (options) => {
      sentMails.push(options);
      return { status: true };
    };
    await flushRateLimit(services.redis);
    const mlKeys = await services.redis.keys('ml:*');
    if (mlKeys.length) await services.redis.del(...mlKeys);
  });

  afterAll(async () => {
    services.mails.send = originalSend;
    await core.services.shutdown({ clear: true });
  });

  // onSendMagicLink fires the send in the background (fire-and-forget so BA's
  // response time is uniform); poll the recorded mails for up to `timeout`.
  async function waitForMail(template, timeout = 3000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const mail = sentMails.find((m) => m.template === template);
      if (mail) return mail;
      // eslint-disable-next-line no-await-in-loop
      await sleep(25);
    }
    return null;
  }

  // Token + callbackURL travel in the confirm URL *fragment* (#…).
  function parseConfirm(magicLink) {
    const url = new URL(magicLink);
    const frag = new URLSearchParams(url.hash.replace(/^#/, ''));
    return {
      pathname: url.pathname,
      token: frag.get('token'),
      callbackURL: frag.get('callbackURL'),
    };
  }

  // Mirror the confirm page's verify-URL construction: callbackURL is
  // pre-encoded (encodeURIComponent) to compensate BA's double-decode.
  function verifyUrl(token, callbackURL) {
    const p = new URLSearchParams({ token });
    if (callbackURL) p.set('callbackURL', encodeURIComponent(callbackURL));
    return `/api/auth/magic-link/verify?${p.toString()}`;
  }

  function postMagicLink(email, callbackURL = '/post-activate?next=/home') {
    return request(app)
      .post('/api/auth/sign-in/magic-link')
      .set('Content-Type', 'application/json')
      .send({ email, callbackURL, metadata: { lang: 'fr' } });
  }

  async function createUser(email, { isActivated = true } = {}) {
    return usersSvc.create(
      {
        fullName: `Magic ${email}`,
        email,
        password: 'plainPwd-34-strong',
        isActivated,
      },
      { internal: true, detailed: true },
    );
  }

  it('existing active account → magicLink mail to a fragment-token confirm URL', async () => {
    const email = 'magic-existing-34@oa.test';
    await createUser(email);

    const res = await postMagicLink(email);
    expect(res.status).toBe(200);

    const mail = await waitForMail('magicLink');
    expect(mail).toBeTruthy();
    expect(mail.to).toBe(email);
    expect(mail.lang).toBeTruthy();

    const confirm = parseConfirm(mail.data.magicLink);
    expect(confirm.pathname).toBe('/auth/magic-link/confirm');
    // Token is in the fragment, never in the query (so it's invisible to a
    // server-side prefetch).
    expect(confirm.token).toBeTruthy();
    expect(new URL(mail.data.magicLink).searchParams.get('token')).toBeNull();
    const cb = new URL(confirm.callbackURL, 'http://x.test');
    expect(cb.pathname).toBe('/post-activate');
  });

  it('unknown email → magicLinkNoAccount CTA mail with no token', async () => {
    const email = 'magic-unknown-34@oa.test';

    const res = await postMagicLink(email);
    expect(res.status).toBe(200);

    const mail = await waitForMail('magicLinkNoAccount');
    expect(mail).toBeTruthy();
    expect(mail.to).toBe(email);
    // A locale is REQUIRED: the mailer renders nothing (silent no-op) without
    // one. There is no DB user here, so it must come from metadata.lang.
    expect(mail.lang).toBe('fr');
    const signup = new URL(mail.data.signupLink);
    expect(signup.pathname).toBe('/auth/signup');
    expect(signup.searchParams.get('email')).toBe(email);
    expect(sentMails.find((m) => m.template === 'magicLink')).toBeFalsy();
  });

  it('blacklisted account → 200 but no mail at all (silent)', async () => {
    const email = 'magic-blacklist-34@oa.test';
    await createUser(email);
    await services
      .knex(testConfig.schemas.user)
      .where({ email })
      .update({ is_blacklisted: 1 });

    const res = await postMagicLink(email);
    expect(res.status).toBe(200);

    await sleep(400);
    expect(sentMails).toEqual([]);
  });

  it('verify flow activates a not-yet-activated user and opens a session', async () => {
    const email = 'magic-activate-34@oa.test';
    await createUser(email, { isActivated: false });

    await postMagicLink(email);
    const mail = await waitForMail('magicLink');
    const { token, callbackURL } = parseConfirm(mail.data.magicLink);

    const verifyRes = await request(app).get(verifyUrl(token, callbackURL));

    expect(verifyRes.status).toBe(302);
    const setCookies = [].concat(verifyRes.headers['set-cookie'] || []);
    expect(setCookies.some((c) => /oa\.session_token=/.test(c))).toBe(true);

    const dbUser = await services
      .knex(testConfig.schemas.user)
      .where({ email })
      .first();
    expect(dbUser.is_activated).toBe(1);

    const inbox = await new services.inboxes.Inbox({
      type: 'user',
      identifier: dbUser.uid,
    })._get();
    expect(inbox.data).toBeTruthy();
  });

  it('re-using the same magic-link token does not open a second session', async () => {
    const email = 'magic-replay-34@oa.test';
    await createUser(email);

    await postMagicLink(email);
    const mail = await waitForMail('magicLink');
    const { token, callbackURL } = parseConfirm(mail.data.magicLink);
    const verifyPath = verifyUrl(token, callbackURL);

    const first = await request(app).get(verifyPath);
    expect(first.status).toBe(302);
    expect(
      []
        .concat(first.headers['set-cookie'] || [])
        .some((c) => /oa\.session_token=/.test(c)),
    ).toBe(true);

    const second = await request(app).get(verifyPath);
    expect(
      []
        .concat(second.headers['set-cookie'] || [])
        .some((c) => /oa\.session_token=/.test(c)),
    ).toBe(false);
  });

  it('blacklisting between send and verify blocks the session (after-hook guard)', async () => {
    const email = 'magic-verifyblock-34@oa.test';
    await createUser(email);

    await postMagicLink(email);
    const mail = await waitForMail('magicLink');
    const { token, callbackURL } = parseConfirm(mail.data.magicLink);

    await services
      .knex(testConfig.schemas.user)
      .where({ email })
      .update({ is_blacklisted: 1 });

    const verifyRes = await request(app).get(verifyUrl(token, callbackURL));

    expect(verifyRes.status).toBe(302);
    expect(verifyRes.headers.location).toBe(
      '/auth/signin?msg=accountUnavailable',
    );
    const setCookies = [].concat(verifyRes.headers['set-cookie'] || []);
    expect(setCookies.some((c) => /oa\.session_token=[^;]+[^;]/.test(c))).toBe(
      false,
    );
  });

  it('per-email cooldown skips a second send within 60s but still answers 200', async () => {
    const email = 'magic-cooldown-34@oa.test';
    await createUser(email);

    const first = await postMagicLink(email);
    expect(first.status).toBe(200);
    // Wait for the first send to complete so its cooldown key is set.
    expect(await waitForMail('magicLink')).toBeTruthy();

    sentMails = [];
    const second = await postMagicLink(email);
    expect(second.status).toBe(200);

    await sleep(400);
    expect(sentMails).toEqual([]);
  });

  it('round-trips a callbackURL with a nested query through verify intact', async () => {
    // Guards the double-decode compensation: BA's verify decodes callbackURL
    // twice, so a `next` carrying its own `?a=1&b=2` would be corrupted without
    // the confirm page's pre-encode.
    const email = 'magic-nested-34@oa.test';
    await createUser(email);
    const nested = '/post-activate?next=%2Fa%2Fadmin%2Fevents%3Fstatus%3Dpublished%26page%3D2&agenda=foo';

    await postMagicLink(email, nested);
    const mail = await waitForMail('magicLink');
    const { token, callbackURL } = parseConfirm(mail.data.magicLink);
    expect(callbackURL).toBe(nested);

    const verifyRes = await request(app).get(verifyUrl(token, callbackURL));
    expect(verifyRes.status).toBe(302);
    // On success BA redirects to callbackURL; /post-activate must receive the
    // full nested `next` (not truncated at the inner `&`) + the agenda param.
    const loc = new URL(verifyRes.headers.location, 'http://x.test');
    expect(loc.pathname).toBe('/post-activate');
    expect(loc.searchParams.get('next')).toBe(
      '/a/admin/events?status=published&page=2',
    );
    expect(loc.searchParams.get('agenda')).toBe('foo');
  });

  it('echoes the caller callbackURL (agenda context) into the confirm fragment', async () => {
    const email = 'magic-agenda-34@oa.test';
    await createUser(email);

    await postMagicLink(
      email,
      '/post-activate?next=%2Flyon%2Fcontribute&agenda=lyon',
    );

    const mail = await waitForMail('magicLink');
    const { callbackURL } = parseConfirm(mail.data.magicLink);
    const cb = new URL(callbackURL, 'http://x.test');
    expect(cb.pathname).toBe('/post-activate');
    expect(cb.searchParams.get('agenda')).toBe('lyon');
    expect(cb.searchParams.get('next')).toBe('/lyon/contribute');
  });
});
