import crypto from 'node:crypto';
import mysql from 'mysql2';
import logs from '@openagenda/logs';
import Auth from '@openagenda/auth';
import runOnActivation from '../users/lib/runOnActivation.js';
import computePostActivateRedirect from '../../auth/lib/computePostActivateRedirect.js';

const log = logs('services/auth');

// --- Magic-link per-email throttle ---------------------------------------
// BA's plugin rate-limit is per-IP; this protects a *targeted inbox* (the real
// spam/harassment vector). 60s cooldown (anti rapid-bombing, matches a
// "resend in 60s" UX) + 5/hour cap (generous for a legit retry).
const MAGIC_LINK_COOLDOWN_S = 60;
const MAGIC_LINK_HOURLY_MAX = 5;
const MAGIC_LINK_HOURLY_WINDOW_S = 3600;

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function magicLinkEmailKey(email) {
  return crypto.createHash('sha256').update(email).digest('hex').slice(0, 32);
}

// Returns true when the send must be skipped. Initializes the hourly counter
// with its TTL atomically (SET NX EX) before incrementing, so the key can never
// get stuck without an expiry.
async function magicLinkThrottled(redis, email) {
  const key = magicLinkEmailKey(email);
  const cooldownKey = `ml:cd:${key}`;
  if (await redis.get(cooldownKey)) return true;

  const hourlyKey = `ml:h:${key}`;
  await redis.set(hourlyKey, 0, 'EX', MAGIC_LINK_HOURLY_WINDOW_S, 'NX');
  const count = await redis.incr(hourlyKey);
  if (count > MAGIC_LINK_HOURLY_MAX) return true;

  await redis.set(cooldownKey, '1', 'EX', MAGIC_LINK_COOLDOWN_S);
  return false;
}

// Minimum complexity gate, mirrored from the legacy `auth/local.front.js`
// `passwordComplexity` helper. Reused by `validateSignUp` so the BA-native
// /sign-up/email endpoint enforces the same rules as the retired wrapper.
function evaluatePasswordComplexity(security, body) {
  const password = body?.password;
  if (typeof password !== 'string' || password.length === 0) {
    return { field: 'password', code: 'passwordRequired' };
  }
  const identifiers = {
    full_name: body?.full_name ?? body?.name,
    email: body?.email,
  };
  const { score, isSameAs } = security.passwords.evaluate(password, {
    identifiers,
  });
  if (isSameAs) return { field: 'password', code: 'isSameAs' };
  if (score === 0) return { field: 'password', code: 'tooWeak' };
  return null;
}

// Passport-style "repeat" field is not part of BA's sign-up schema. The Next
// signup form keeps a client-side check, but we duplicate it here so any
// non-Next caller still gets the legacy guarantee.
function evaluatePasswordMatch(body) {
  if (typeof body?.repeat === 'string' && body.password !== body.repeat) {
    return { field: 'repeat', code: 'passwordNotEqual' };
  }
  return null;
}

async function evaluateCaptcha({ body, mtCaptcha }) {
  if (!mtCaptcha?.enabled) return null;
  const captchaToken = body?.['mtcaptcha-verifiedtoken'];
  if (!captchaToken) {
    log('info', 'mtCaptcha token is missing');
    return { field: 'captcha', code: 'captchaRequired' };
  }
  try {
    const response = await fetch(
      `${mtCaptcha.verifyUrl}?privatekey=${mtCaptcha.privateKey}&token=${captchaToken}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      return { field: 'captcha', code: 'captchaTryAgain' };
    }
  } catch (err) {
    log('error', 'Error with the mtCaptcha service', err);
    return { field: 'captcha', code: 'captchaTryAgain' };
  }
  return null;
}

export async function init(config, services) {
  const { schemas, mtCaptcha } = config;

  const mysqlPool = mysql.createPool({
    ...config.db,
    waitForConnections: true,
    connectionLimit: 10,
  });

  // Magic-link delivery. BA calls onSendMagicLink for every
  // /sign-in/magic-link regardless of whether the email matches an account (it
  // only checks existence at verify), so ALL the branching lives here — there
  // is no Express façade (the Next UI posts straight to /api/auth/sign-in/
  // magic-link, like sign-in/email and request-password-reset):
  //   - existing active account → magic-link mail;
  //   - unknown email           → "create an account" CTA, no token;
  //   - blacklisted / removed   → nothing (silent);
  //   - throttled               → nothing.
  // The token is put in the URL *fragment* (#…), which is never sent to the
  // server: an email scanner that prefetches the link can't read or consume the
  // one-time token. The Next confirm page reads it client-side and navigates to
  // the verify endpoint — no button, no friction.
  const deliverMagicLink = async ({
    email: rawEmail,
    url,
    token,
    metadata,
  }) => {
    const email = normalizeEmail(rawEmail);
    if (!email) return;
    if (await magicLinkThrottled(services.redis, email)) return;

    // The UI forwards its current locale via BA's `metadata` channel. Required:
    // the mailer renders nothing (and silently no-ops) when `lang` is missing.
    // `fr` matches the cibul-node request default.
    const lang = (typeof metadata?.lang === 'string' && metadata.lang) || 'fr';

    const oaUser = await services.users.findOne({
      query: { email },
      detailed: true,
    });

    if (!oaUser) {
      // Unknown email → token-less CTA to the standard signup form. Harmless to
      // a third party (only the inbox owner sees it); useful to the legitimate
      // owner who expected a link.
      const signupURL = new URL('/auth/signup', config.root);
      signupURL.searchParams.set('email', email);
      await services.mails.send({
        template: 'magicLinkNoAccount',
        to: email,
        lang,
        data: { signupLink: signupURL.toString(), emailSettingsLink: null },
        queue: false,
      });
      return;
    }

    // Primary gate (the authoritative one is the BA after-hook on
    // /magic-link/verify): never send a link to a banned account.
    if (oaUser.isBlacklisted || oaUser.isRemoved) return;

    // callbackURL is the one the UI passed to /sign-in/magic-link (BA echoes it
    // into `url`); we route it through the confirm-page fragment unchanged.
    const callbackURL = new URL(url).searchParams.get('callbackURL') ?? '/';
    const confirmURL = new URL('/auth/magic-link/confirm', config.root);
    confirmURL.hash = new URLSearchParams({ token, callbackURL }).toString();

    await services.mails.send({
      template: 'magicLink',
      to: email,
      lang: oaUser.culture || lang,
      data: { magicLink: confirmURL.toString(), emailSettingsLink: null },
      queue: false,
    });
  };

  const authLogger = { log: logs('auth') };

  const auth = Auth({
    mysqlPool,
    redis: services.redis,
    secret: config.auth.secret,
    baseURL: config.root,
    logger: authLogger,
    // The in-process API resource (v3) auth protects + mints exchanged tokens
    // for. The MCP resource is no longer a top-level option — it rides in the
    // exchange registry as the MCP client's `subjectResource`.
    apiResourceUrl: config.v3ResourceUrl,
    // O2.5 token-exchange (RFC 8693) — exposes /oauth2/token-exchange only when
    // apiResourceUrl and ≥1 registered client are set (see tokenExchangePlugin.js).
    exchangeClients: config.exchangeClients,
    exchangeTokenTtl: config.exchangeTokenTtl,
    trustedOrigins: [config.root, ...config.auth?.trustedOrigins ?? []],
    schemas: {
      user: schemas.user,
      session: schemas.session,
      account: schemas.account,
      verification: schemas.verification,
      apiKey: schemas.apiKey,
      oauthClient: schemas.oauthClient,
      oauthAccessToken: schemas.oauthAccessToken,
      oauthRefreshToken: schemas.oauthRefreshToken,
      oauthConsent: schemas.oauthConsent,
      jwks: schemas.jwks,
    },
    google: config.auth?.google?.id ? config.auth.google : undefined,
    facebook: config.auth?.facebook?.id ? config.auth.facebook : undefined,
    onAfterOAuthSignUp: async (user) => {
      try {
        const oaUser = await services.users.findOne({
          query: { id: user.id },
          detailed: true,
        });
        if (!oaUser) return;
        await runOnActivation(services, oaUser);
        services.users
          .refresh(oaUser.uid, { lastSignin: true })
          .catch((err) => log('warn', 'lastSignin refresh failed', { err }));
      } catch (err) {
        log('error', 'onAfterOAuthSignUp failed', { userId: user?.id, err });
      }
    },
    onEmailVerified: async (user) => {
      try {
        const oaUser = await services.users.findOne({
          query: { id: user.id },
          detailed: true,
        });
        if (!oaUser) return;
        await runOnActivation(services, oaUser);
      } catch (err) {
        log('error', 'onEmailVerified failed', { userId: user?.id, err });
      }
    },
    onSendVerificationEmail: async ({ user, url }) => {
      try {
        await services.mails.send({
          template: 'activateAccount',
          to: user.email,
          lang: user.culture,
          data: {
            activateLink: url,
            emailSettingsLink: null,
          },
          queue: false,
        });
      } catch (err) {
        log('error', 'sendVerificationEmail failed', { userId: user?.id, err });
      }
    },
    onSendPasswordResetEmail: async ({ user, url }) => {
      try {
        await services.mails.send({
          template: 'resetPassword',
          to: user.email,
          lang: user.culture,
          data: {
            resetLink: url,
            emailSettingsLink: null,
          },
          queue: false,
        });
      } catch (err) {
        log('error', 'sendPasswordResetEmail failed', {
          userId: user?.id,
          err,
        });
      }
    },
    // Private "email channel" for a signup attempt on an already-registered
    // address. The screen response is generic and constant-time (BA's
    // anti-enumeration synthetic 200), so the only way the legitimate owner
    // learns the attempt happened is via their inbox — and a tester probing
    // an email learns nothing. `user` is the EXISTING account (BA model
    // shape: `emailVerified` === `is_activated`).
    onExistingUserSignUp: async ({ user }) => {
      try {
        // Never activated → the owner never finished their original signup.
        // Re-issue the activation link so this re-attempt can complete,
        // rather than dead-ending on a generic "account exists" notice.
        // Reuses the same BA flow as the resend panel → `activateAccount`.
        if (!user.emailVerified) {
          // Same callbackURL contract as the normal resend path
          // (users/hooks/sendVerificationEmailOnCreate.js) so the activation
          // link routes through /post-activate instead of dead-ending at '/'.
          await auth.api.sendVerificationEmail({
            body: {
              email: user.email,
              callbackURL: computePostActivateRedirect(),
            },
          });
          return;
        }

        // Activated → tell the owner an account already exists and point them
        // to login / password reset. Queued (not inline SMTP) so this fires in
        // the background and never blocks the anti-enumeration signup response
        // on mail I/O. `culture` may be null on legacy rows → fall back to a
        // built locale so the render never throws (which would silently drop
        // the only notification the owner gets).
        await services.mails.send({
          template: 'accountAlreadyExists',
          to: user.email,
          lang: user.culture || 'en',
          data: {
            loginLink: `${config.root}/auth/signin`,
            resetLink: `${config.root}/auth/signin?view=lost`,
          },
          queue: true,
        });
      } catch (err) {
        log('error', 'onExistingUserSignUp failed', {
          userId: user?.id,
          err,
        });
      }
    },
    onSendMagicLink: async ({ email, url, token, metadata }) => {
      // Fire-and-forget: return immediately so BA's response time does not
      // depend on the branch (existing / unknown / blacklisted) — no timing
      // oracle for account enumeration. Errors are logged, never surfaced.
      deliverMagicLink({ email, url, token, metadata }).catch((err) => {
        log('error', 'sendMagicLink failed', { err });
      });
    },
    // BA fires this after a successful /sign-in/email or /callback/:id —
    // see packages/auth/src/index.js. The post-signin "lastSignin refresh"
    // (previously inside auth/local.front.js + betterAuthSignin.js) lives
    // here now. Errors are swallowed by the auth package, but we also log
    // here so the failure surfaces in the cibul-node log namespace.
    //
    // The FB-unlink redirect is NOT in this callback — it's already a
    // response-header rewrite in the BA after-hook (`/callback/:id` and
    // before that the legacy server-side `auth.signin` helper). Leaving
    // it server-side keeps the redirect deterministic from the browser's
    // point of view (302 right out of /api/auth/*). Client-side, the Next
    // form reads the BA response and follows it.
    onSignInSuccess: async ({ user }) => {
      if (user?.uid !== undefined && user?.uid !== null) {
        services.users.refresh(user.uid, { lastSignin: true }).catch((err) => {
          log('warn', 'lastSignin refresh failed', { uid: user?.uid, err });
        });
      }
    },
    // O3 — audit trail for the public DCR endpoint. The auth package emits a
    // sanitized descriptor (never the client_secret) after each successful
    // /oauth2/register; we log it under one event name so it can be filtered
    // into a dashboard / alerting downstream. `registeredBy: null` flags an
    // anonymous registration (the common, and most abuse-prone, MCP case).
    onClientRegistered: (entry) =>
      log('info', 'oauth.client.registered', entry),
    // Fires on BA's user create.after — every signup, email + OAuth, BEFORE
    // email verification. This is the "new user" Discord notification's home
    // now: pre-better-auth it rode the Feathers `users.create` onCreate hook,
    // which BA signups bypass (they write via the kysely adapter). Matches the
    // legacy timing (notify at creation, not activation). `services.discord` is
    // read lazily because the discord service initialises after auth, and is
    // undefined when disabled (e.g. tests) — hence the optional chain + swallow
    // (aligned with the onCreate hook's log-and-continue policy). BA already
    // owns the verification email; nothing else post-signup lives here.
    onSignUpComplete: async (user) => {
      try {
        await services.discord?.notifyUserCreation({
          fullName: user.name,
          email: user.email,
          uid: user.uid,
        });
      } catch (err) {
        log('error', 'discord notifyUserCreation failed', {
          userId: user?.id,
          err,
        });
      }
    },
    // Mirrors the legacy `auth/local.front.js` signup pre-checks:
    //   passwordComplexity → passwordMatchCheck → captchaCheck.
    // Returning `{ errors: { … } }` causes the BA before-hook to throw
    // BAD_REQUEST with details, which the OA-side `signupSubmit` shape
    // (errors keyed by field, value = i18n code) maps unchanged.
    validateSignUp: async ({ body }) => {
      const errors = {};

      const complexity = evaluatePasswordComplexity(services.security, body);
      if (complexity) errors[complexity.field] = complexity.code;

      const match = evaluatePasswordMatch(body);
      if (match && !errors[match.field]) errors[match.field] = match.code;

      const captcha = await evaluateCaptcha({ body, mtCaptcha });
      if (captcha) errors[captcha.field] = captcha.code;

      return Object.keys(errors).length > 0 ? { errors } : undefined;
    },
  });

  // Periodic GC of rows neither better-auth nor the oauth-provider purge on
  // their own (expired sessions/tokens, never-approved DCR clients > 30d). The
  // deletion logic lives in @openagenda/auth (it owns the schema); here we only
  // schedule + run it.
  //
  // A bullmq repeatable job (not a setInterval): a single run across the cluster
  // with the schedule persisted in Redis, so it survives restarts. The worker is
  // built here but only `.run()` on the worker process (via tasks.processQueue
  // from task.js) — never on the web processes. Mirrors services/users.
  const { bull } = services;
  const gcQueue = new bull.Queue('auth', { prefix: '{auth}' });
  const gcWorker = new bull.Worker(
    gcQueue.name,
    async (job) => {
      if (job.name === 'gcExpiredOAuth') {
        // `job.log` lines surface in the bull-board "Logs" tab for this run;
        // the namespaced `log()` lines go to the cibul-node log stream.
        await job.log('started');
        const summary = await auth.gcExpired({ olderThanDays: 30 });
        await job.log(`completed ${JSON.stringify(summary)}`);
        log('info', 'oauth.gc.completed', summary);
        return summary;
      }
      log('warn', `unknown auth job ${job.name}`);
      return undefined;
    },
    {
      prefix: gcQueue.opts.prefix,
      autorun: false,
      concurrency: 1,
      removeOnComplete: { age: 7 * 24 * 3600, count: 100 },
      removeOnFail: { age: 30 * 24 * 3600, count: 100 },
    },
  );
  gcWorker.on('error', (err) => log('error', 'auth worker error', err));
  gcWorker.on('failed', (job, err) =>
    log('error', 'oauth.gc.failed', { jobId: job?.id, err }));

  return Object.assign(auth, {
    tasks: {
      // Registers the schedule AND starts the worker, on the worker process
      // only. Keeping the Redis round-trip out of init mirrors services/users
      // (init just constructs the objects) and avoids the web processes
      // touching the scheduler. Idempotent: the same scheduler id is upserted.
      processQueue: async () => {
        try {
          await gcQueue.upsertJobScheduler(
            'oauth-gc-daily',
            { pattern: '17 3 * * *' },
            { name: 'gcExpiredOAuth' },
          );
        } catch (err) {
          log('error', 'failed to register oauth GC schedule', err);
        }
        gcWorker.run();
      },
    },
    shutdown: async () => {
      await gcWorker.close();
      await gcQueue.close();
      await new Promise((resolve, reject) => {
        mysqlPool.end((err) => (err ? reject(err) : resolve()));
      });
    },
  });
}
