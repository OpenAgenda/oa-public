import mysql from 'mysql2';
import logs from '@openagenda/logs';
import Auth, { projectUser } from '@openagenda/auth';
import runOnActivation from '../users/lib/runOnActivation.js';

const log = logs('services/auth');

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
  const imageBucketPath = config.s3.mainBucketPath;

  const mysqlPool = mysql.createPool({
    ...config.db,
    waitForConnections: true,
    connectionLimit: 10,
  });

  const auth = Auth({
    mysqlPool,
    redis: services.redis,
    secret: config.auth.secret,
    baseURL: config.root,
    trustedOrigins: [config.root, ...config.auth?.trustedOrigins ?? []],
    schemas: {
      user: schemas.user,
      account: schemas.account,
      verification: schemas.verification,
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
    // Fires on every user.create — including OAuth signup. BA already runs
    // sendVerificationEmail on /sign-up/email; the legacy Feathers
    // sendVerificationEmailOnCreate hook keeps owning the email path so we
    // don't double-send. Kept as no-op for now: the only post-signup logic
    // worth centralising here would be lastSignin/welcome/etc., none of
    // which exist yet.
    onSignUpComplete: async () => {},
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
    // Wired now so /api/auth/get-session returns the OA-projected user +
    // lang directly, letting `authClient.useSession()` give consumers
    // everything they need without an extra OA endpoint.
    //
    // I/O budget: 1 SELECT user + (later) 1 SELECT agenda max — reruns on
    // every GET /api/auth/get-session.
    resolveSessionExtras: async ({ user }) => {
      let oaUser = null;
      try {
        oaUser = await services.users.findOne({
          query: { id: user.id },
          detailed: true,
        });
      } catch (err) {
        log('warn', 'resolveSessionExtras: users.findOne failed', {
          userId: user?.id,
          err,
        });
      }
      const projectedBase = projectUser(oaUser ?? user);
      const projected = projectedBase
        ? {
          ...projectedBase,
          // Absolute thumbnail URL — bucket prefix is a runtime config, so
          // it lives here, not in the pure projectUser helper.
          thumbnail: oaUser?.image ? imageBucketPath + oaUser.image : null,
          // Surface the legacy field that downstream consumers still read.
          fullName: oaUser?.fullName ?? projectedBase.name ?? null,
          transverseApiAccess: oaUser?.transverseApiAccess ?? false,
          isNew: !!oaUser?.isNew,
        }
        : null;

      // TODO: resolve the contextual agenda (slug from `request.url` path
      // or referer) when the Next signin/signup forms need it. Skipped here
      // to keep the I/O budget at 1 SELECT user / call.
      return {
        user: projected ?? user,
        lang: oaUser?.culture ?? user?.culture ?? null,
      };
    },
  });

  return Object.assign(auth, {
    shutdown: async () => {
      await new Promise((resolve, reject) => {
        mysqlPool.end((err) => (err ? reject(err) : resolve()));
      });
    },
  });
}
