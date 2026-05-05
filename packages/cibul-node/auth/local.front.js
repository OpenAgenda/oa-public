import fs from 'node:fs';
import _ from 'lodash';
import qs from 'qs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import * as invitationsSvc from '@openagenda/invitations';
import makeLabelGetter from '@openagenda/labels';
import authSigninLabels from '@openagenda/labels/auth/signin.js';
import authErrorsLabels from '@openagenda/labels/auth/errors.js';
import authActivationLabels from '@openagenda/labels/auth/activation.js';
import logs from '@openagenda/logs';
import flattenLabels from '@openagenda/labels/flatten.js';
import manualLabels from '@openagenda/labels/auth/manual.js';
import { fromMarkdownToHTML } from '@openagenda/md';
import { BadRequest } from '@openagenda/verror';
import cmn from '../lib/commons-app.js';
import config from '../config/index.js';
import layouts from '../services/lib/layouts/index.js';
import rateLimiter from '../lib/rateLimiter.js';
import * as auth from './lib/auth.js';
import { wantsJson } from './lib/utils.js';
import loadCaptcha from './lib/captcha.js';
import betterAuthSignin from './lib/betterAuthSignin.js';

const log = logs('auth/local');

const getLabel = makeLabelGetter(authSigninLabels);
const getErrorLabel = makeLabelGetter(authErrorsLabels);
const __ = makeLabelGetter(authActivationLabels);

const manualTemplate = _.template(
  fs.readFileSync(`${import.meta.dirname}/manual.tpl`, 'utf-8'),
);

const useOptions = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
};

const preMw = [cmn.loadBaseData(auth.layoutData, 'oa-main.css')];

const renderManualPage = ((labels, lang) =>
  manualTemplate(flattenLabels(labels, lang))).bind(
  null,
  Object.keys(manualLabels).reduce(
    (html, key) => ({
      ...html,
      [key]: Object.keys(manualLabels[key]).reduce(
        (label, lang) => ({
          ...label,
          [lang]: fromMarkdownToHTML(manualLabels[key][lang]),
        }),
        {},
      ),
    }),
    {},
  ),
);

function redirectToContribute(req, res) {
  res.redirect(302, `/${req.agenda.slug}/contribute`);
}

function signinError(req, res, err, logBundle) {
  log.info('signin attempt failed', { ...logBundle, error: err });

  const passwordMsg = getErrorLabel('incorrectCredentials', req.lang)
    || getLabel('incorrectPassword', req.lang);

  const values = {
    req,
    res,
    err,
    user: null,
    data: {
      ...req.body,
      errors: { password: passwordMsg },
    },
  };

  return auth.renderSignin(values);
}

async function signinSubmit(req, res) {
  const logBundle = {
    ip: req.ip,
    agenda: _.pick(req.agenda, ['slug', 'title', 'uid']),
    email: req.body.email,
  };
  log.info('signin attempt', logBundle);

  const { services } = req.app;
  const { auth: authSvc, users } = services;

  let result;
  try {
    result = await authSvc.api.signInEmail({
      body: { email: req.body.email, password: req.body.password },
      asResponse: true,
    });
  } catch (err) {
    return signinError(req, res, err, logBundle);
  }

  let session;
  try {
    session = await authSvc.api.getSession({
      headers: authSvc.toHeaders(req, result),
    });
  } catch (err) {
    log.warn('failed to read better-auth session after signin', { err });
  }

  if (!session?.user) {
    return signinError(
      req,
      res,
      new Error('session not established'),
      logBundle,
    );
  }

  let oaUser;
  try {
    oaUser = await users.findOne({
      query: { id: session.user.id },
      detailed: true,
    });
  } catch (err) {
    log.error('failed to load OA user after signin', { err });
    return cmn.catchError(req, res, wantsJson(req))(err);
  }

  if (!oaUser) {
    return signinError(req, res, new Error('OA user not found'), logBundle);
  }

  if (!oaUser.isActivated) {
    try {
      const out = await authSvc.api.signOut({
        headers: authSvc.toHeaders(req, result),
        asResponse: true,
      });
      authSvc.forwardSetCookieHeaders(out, res);
    } catch (err) {
      log.warn('signOut after !isActivated failed', { err });
    }
    return auth.redirectToResend({ req, res, user: oaUser });
  }

  log.info('signin attempt successful', logBundle);

  authSvc.forwardSetCookieHeaders(result, res);

  return betterAuthSignin({
    services,
    req,
    res,
    email: req.body.email,
    password: req.body.password,
    oaUser,
    result,
  });
}

function passwordComplexity(values) {
  const { security } = values.req.app.services;

  if (!values.req.body.password) {
    _.set(values, 'data.errors.password', 'passwordRequired');
    return values;
  }

  const { score, isSameAs } = security.passwords.evaluate(
    values.req.body.password,
    {
      identifiers: _.pick(values.req.body, ['full_name', 'email']),
    },
  );

  if (isSameAs) {
    _.set(values, 'data.errors.password', 'isSameAs');
  } else if (score === 0) {
    _.set(values, 'data.errors.password', 'tooWeak');
  }

  return values;
}

function passwordMatchCheck(values) {
  if (values.req.body.password !== values.req.body.repeat) {
    if (!values.data.errors) values.data.errors = {};

    values.data.errors.repeat = 'passwordNotEqual';
  }

  return values;
}

async function captchaCheck(values) {
  if (!config.mtCaptcha.enabled) return values;

  const captchaToken = values.req.body['mtcaptcha-verifiedtoken'];

  if (!captchaToken) {
    log.info('mtCaptcha token is missing');
    values.data.errors = {
      ...values.data.errors,
      captcha: 'captchaRequired',
    };
    return values;
  }

  const { verifyUrl, privateKey } = config.mtCaptcha;
  let result;

  try {
    const response = await fetch(
      `${verifyUrl}?privatekey=${privateKey}&token=${captchaToken}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    result = await response.json();
  } catch (e) {
    log.error('Error with the mtCaptcha service', e);
    values.data.errors = {
      ...values.data.errors,
      captcha: 'captchaTryAgain',
    };
    return values;
  }

  if (!result.success) {
    values.data.errors = {
      ...values.data.errors,
      captcha: 'captchaTryAgain',
    };
    return values;
  }

  const { tokeninfo: tokenInfo } = result;

  log.info('mtCaptcha ip check', {
    tokenInfoIP: tokenInfo.ip,
    ip: values.req.ip,
  });

  return values;
}

function handleSigninRequest(req, email, password, cb) {
  const { users } = req.app.services;

  users
    .verifyPassword(password, {
      query: { email },
    })
    .then(async (validPassword) => {
      if (!validPassword) {
        return cb(null, null, {
          email,
          password,
          user: null,
          errors: {
            password: getErrorLabel('incorrectCredentials', req.lang),
          },
        });
      }

      const user = await users.findOne({ query: { email }, detailed: true });

      cb(null, user, { email, password, user });
    })
    .catch((err) => {
      if (err.name === 'NotFound') {
        return cb(null, null, {
          email,
          password,
          user: null,
          errors: {
            password: getErrorLabel('incorrectCredentials', req.lang),
          },
        });
      }
      cb(err);
    });
}

function pLoadCaptcha(v) {
  return new Promise((rs) => {
    loadCaptcha(v.req, v.res, () => {
      rs(v);
    });
  });
}

function signupSubmit(req, res) {
  const { users } = req.app.services;
  const logBundle = {
    ip: req.ip,
    email: req.body.email,
    fullName: req.body.full_name,
    agenda: _.pick(req.agenda, ['slug', 'title', 'uid']),
  };

  // Capture plaintext password locally before any downstream middleware can
  // mutate req.body (Fix 2). Used to open a better-auth session after
  // users.create when the resulting user is already activated.
  const plaintextPassword = req.body.password;

  log.info('signup attempt', logBundle);

  new Promise((rs) => rs({ req, res, data: req.body }))
    .then(passwordComplexity)

    .then(passwordMatchCheck)

    .then(captchaCheck)

    .then(async (values) => {
      if (values.data.errors) {
        log.info('signup attempt failed', {
          ...logBundle,
          errors: values.data.errors,
        });
        return values;
      }

      const optionals = _.pickBy(
        _.pick(
          { ...req.query, ...req.body },
          'iToken',
          'invitation',
          'redirect',
          'agenda',
        ),
      );

      if (req.agenda) {
        optionals.agenda = req.agenda;
      }

      try {
        const user = await users.create(
          {
            fullName: req.body.full_name,
            email: req.body.email,
            password: plaintextPassword,
            culture: req.body.culture || req.lang,
          },
          {
            detailed: true,
            tokenOptionals: optionals,
            optionals,
          },
        );

        if (user) {
          log.info('signup attempt successful, created user', logBundle);
          values.user = user;
        }
      } catch (err) {
        values.data.errors = {};

        if (
          err
          && _.find(err.errors, { field: 'fullName', code: 'string.toolong' })
        ) {
          values.data.errors.fullName = 'fullNameTooLong';
        }

        if (
          err
          && _.find(err.errors, { field: 'email', code: 'email.invalid' })
        ) {
          values.data.errors.email = 'invalidEmail';
        }

        if (
          err
          && _.find(err.errors, { field: 'password', code: 'string.tooshort' })
        ) {
          values.data.errors.password = 'passwordTooShort';
        }

        if (
          err
          && _.find(err.errors, { field: 'fullName', code: 'required' })
        ) {
          values.data.errors.fullName = 'fieldCannotBeEmpty';
        }

        if (err && err.message === 'Already exist') {
          values.data.errors.email = 'usedEmail';
        }

        if (_.isObject(err.errors) && Object.keys(err.errors) > 0) {
          values.data.errors = err.errors;
        }

        log.info('signup attempt failed', {
          ...logBundle,
          errors: values.data?.errors,
        });
      }

      return values;
    })

    .then(
      auth.ifUserLoaded(true, auth.ifUserActivated(false, auth.signupSuccess)),
    )

    .then(
      auth.ifUserLoaded(
        true,
        auth.ifUserActivated(true, async (values) => {
          if (values.resolved) return values;
          values.resolved = true;
          await betterAuthSignin({
            services: values.req.app.services,
            req: values.req,
            res: values.res,
            email: values.user.email,
            password: plaintextPassword,
            oaUser: values.user,
          });
          return values;
        }),
      ),
    )

    .then(auth.ifUnresolved(pLoadCaptcha))

    .then(auth.ifUnresolved(auth.renderSignup))

    .then(auth.done, cmn.catchError(req, res, wantsJson(req)));
}

function signupComplete(req, res) {
  const resendQuery = Object.assign(auth.loadOptionals(req), {
    email: req.query.email,
  });

  cmn.render(req, res, 'auth/activation', {
    indexed: false,
    agenda: req.agenda,
    email: req.query.email,
    resend:
      (req.agenda
        ? `/${req.agenda.slug}/activate/resend`
        : '/activate/resend')
      + qs.stringify(resendQuery, { addQueryPrefix: true }),
  });
}

// Floor the JSON-path response time so all branches (account exists, already
// activated, no account) complete in roughly the same time. This neutralizes
// the timing-based account-enumeration oracle on /activate/resend. The HTML
// path is unchanged because its UX needs to differentiate.
const RESEND_JSON_MIN_MS = 1500;

async function activateResend(req, res) {
  const { users, tokens, sessions } = req.app.services;
  const isJson = wantsJson(req);
  const startedAt = Date.now();
  const padJsonDelay = async () => {
    if (!isJson) return;
    const remaining = RESEND_JSON_MIN_MS - (Date.now() - startedAt);
    if (remaining > 0) {
      await new Promise((r) => setTimeout(r, remaining));
    }
  };

  if (!req.query.email) {
    if (isJson) {
      await padJsonDelay();
      return res.status(400).json({ success: false, message: 'emailRequired' });
    }
    auth.renderEmail({ req, res, title: 'Resend activation mail' });
    return;
  }

  let user;
  let token;

  const optionals = _.pickBy(
    _.pick(req.query, 'iToken', 'invitation', 'redirect', 'agenda'),
  );

  try {
    user = await users.findOne({
      query: { email: req.query.email },
      detailed: true,
    });

    if (!user) {
      throw new BadRequest(
        { info: { email: req.query.email } },
        'No matching account found for activation resend',
      );
    }

    if (user && user.isActivated) {
      throw new BadRequest(
        { info: { email: req.query.email } },
        'User is already activated, no need to activate',
      );
    }

    token = await tokens.findOne({
      query: { userId: user.id, email: user.email, type: 'aa' },
    });

    if (token) {
      await users.config.interfaces.sendToken(
        config,
        req.app.services,
      )({
        result: token,
        params: { user, optionals },
      });
    } else {
      token = await tokens.create(
        { userId: user.id, email: user.email, type: 'aa' },
        { user, optionals },
      );
    }

    if (isJson) {
      // Always respond with a generic success on the JSON path so the
      // response cannot be used as an account-enumeration oracle (no
      // distinction between "no account", "already activated", and
      // "email re-sent"). The legacy HTML path keeps its existing flash
      // semantics for now.
      await padJsonDelay();
      return res.status(200).json({ success: true });
    }

    sessions.setFlash(
      req,
      res,
      __(
        req.query.origin === 'signin'
          ? 'sendActivateOnSigninAttempt'
          : 'sendAgain',
        req.lang,
      ),
    );

    auth.redirectToComplete({
      ...optionals,
      req,
      res,
      user,
      token: token.token,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      log.warn(error);
    } else {
      log.error(error);
    }

    if (isJson) {
      // See note above: do not differentiate user-not-found vs
      // already-activated; respond with the same shape as success so an
      // attacker can't enumerate accounts via the JSON endpoint. Genuine
      // server errors (statusCode !== 400) still fall through to the
      // generic catchError handler below via cmn.catchError on the route.
      if (error.statusCode === 400) {
        await padJsonDelay();
        return res.status(200).json({ success: true });
      }
      return res.status(500).json({ success: false, message: 'genericError' });
    }

    auth.renderEmail({
      req,
      res,
      data: {
        errors: { email: error ? error.message || error : error },
        email: req.query.email,
      },
    });
  }
}

async function activate(req, res, next) {
  const { users, agendas, tokens, redis } = req.app.services;

  const optionals = _.pickBy(
    _.pick(req.query, 'iToken', 'invitation', 'redirect', 'agenda'),
  );

  const accountActivationMode = await redis.get('accountActivationMode') ?? 'manual';

  if (accountActivationMode === 'manual') {
    const token = await tokens.findOne({
      query: {
        token: req.params.token,
        type: 'aa',
      },
    });

    if (token) {
      await users.findOne({ query: { id: token.userId }, detailed: true });

      await tokens.remove(token.id);
    }

    const html = renderManualPage(req.lang);

    if (req.agenda) {
      return res.send(
        layouts.agenda(html, {
          lang: req.lang,
          agenda: req.agenda,
          cspNonce: res.locals.cspNonce,
        }),
      );
    }

    return res.send(
      layouts.main(html, {
        lang: req.lang,
        title: getLabel(manualLabels.title, req.lang),
        cspNonce: res.locals.cspNonce,
      }),
    );
  }

  try {
    const user = await users.activate(
      0,
      { token: req.params.token },
      { optionals, detailed: true },
    );

    if (!req.query || !req.query.invitation) {
      return auth.signin({ req, res, user });
    }

    invitationsSvc.get(
      { token: req.query.invitation },
      { includeProcessed: true },
      (err, { invitation }) => {
        if (err) {
          log.error('error received while getting invitation', err);
        } else if (!invitation) {
          log('no invitation was found', { token: req.query.invitation });
        }
        if (err || !invitation) return auth.signin({ req, res, user });

        const actions = invitation.data.actions.filter(
          (v) => v.name === 'linkMember',
        );

        if (actions.length !== 1) {
          return auth.signin({ req, res, user });
        }

        log('extracted one linkMember invitation', { actions });
        const { agendaUid } = actions[0].params[0];

        agendas.get({ uid: agendaUid }).then((agenda) => {
          log('loaded agenda', { uid: agenda.uid, slug: agenda.slug });
          req.agenda = agenda;
          log('signing user in', { user });
          auth.signin({ req, res, user });
        }, next);
      },
    );
  } catch (err) {
    log.error(err);
    if (err.message.includes('not found')) {
      return auth.renderInvalidActivation(req, res);
    }

    return cmn.catchError(req, res)(err);
  }
}

export default (app) => {
  const { sessions, agendas, redis } = app.services;

  log('initing');

  // Per-IP throttle on signup. Caps automated account-enumeration probing
  // against the JSON `usedEmail` response while staying generous enough for
  // legitimate retries (typos, captcha failures).
  const signupLimiter = rateLimiter(redis, {
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => `signup|${req.ip}`,
  });

  // Throttle on /activate/resend, primarily keyed by email so a single
  // address can't be mailbombed; falls back to IP when no email is provided.
  const resendLimiter = rateLimiter(redis, {
    windowMs: 60 * 60 * 1000,
    max: 5,
    keyGenerator: (req) =>
      `activate-resend|${(req.query.email || '').toLowerCase() || req.ip}`,
  });

  passport.use(
    'local-signin',
    new LocalStrategy(useOptions, handleSigninRequest),
  );

  // First path segments that are NOT agenda slugs. Used to decide whether
  // an unauthed `/signin?redirect=…` should reroute to the agenda page
  // (so the AuthDialog opens on top of it) or to the standalone signin.
  const RESERVED_TOP_LEVEL = new Set([
    'admin',
    'agendas',
    'api',
    'auth',
    'home',
    'settings',
    'support',
    'signin',
    'signup',
    'activate',
    'signout',
    'newsletter',
    'flash',
    'start',
    'discover',
    'decouvrir',
    'entdecken',
    'reports',
    'static',
    'embed',
    'public',
    'favicon.ico',
    'robots.txt',
  ]);

  function agendaSlugFromRedirect(redirectParam) {
    if (typeof redirectParam !== 'string' || !redirectParam) return null;
    let decoded;
    try {
      decoded = Buffer.from(redirectParam, 'base64').toString('utf-8');
    } catch {
      return null;
    }
    const match = decoded.match(/^\/([^/?#]+)\//);
    if (!match) return null;
    const candidate = match[1];
    if (RESERVED_TOP_LEVEL.has(candidate)) return null;
    return candidate;
  }

  app.get('/signin', (req, res) => {
    const slug = agendaSlugFromRedirect(req.query.redirect);
    if (slug) {
      const search = qs.stringify(
        {
          msg: 'authRequired',
          ...req.query,
          auth: 'signin',
        },
        { addQueryPrefix: true },
      );
      return res.redirect(301, `/${slug}${search}`);
    }
    const search = qs.stringify(req.query, { addQueryPrefix: true });
    res.redirect(301, `/auth/signin${search}`);
  });

  app.get('/:agendaSlug/signin', (req, res) => {
    const search = qs.stringify(
      { auth: 'signin', ...req.query },
      { addQueryPrefix: true },
    );
    res.redirect(301, `/${req.params.agendaSlug}${search}`);
  });

  app.post(
    '/signin',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    signinSubmit,
  );

  app.post(
    '/:agendaSlug/signin',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
    signinSubmit,
  );

  app.get('/signup', (req, res) => {
    const search = qs.stringify(req.query, { addQueryPrefix: true });
    res.redirect(301, `/auth/signup${search}`);
  });

  app.get('/:agendaSlug/signup', (req, res) => {
    const fullName = req.query.email
      ? auth.fullNameFromEmail(req.query.email) || undefined
      : undefined;
    const search = qs.stringify(
      {
        auth: 'signup',
        ...req.query,
        ...fullName ? { fullName } : {},
      },
      { addQueryPrefix: true },
    );
    res.redirect(301, `/${req.params.agendaSlug}${search}`);
  });

  app.post(
    '/signup',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    signupLimiter,
    signupSubmit,
  );

  app.post(
    '/:agendaSlug/signup',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
    signupLimiter,
    signupSubmit,
  );

  app.get(
    '/signup/complete',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    signupComplete,
  );

  app.get(
    '/:agendaSlug/signup/complete',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
    signupComplete,
  );

  app.get(
    '/activate/resend',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    resendLimiter,
    activateResend,
  );

  app.get(
    '/:agendaSlug/activate/resend',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
    resendLimiter,
    activateResend,
  );

  app.get(
    '/activate/:token',
    preMw,
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/home')),
    activate,
  );

  app.get(
    '/:agendaSlug/activate/:token',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
    activate,
  );
};
