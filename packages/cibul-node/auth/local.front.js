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
import * as auth from './lib/auth.js';
import { wantsJson } from './lib/utils.js';
import betterAuthSignin from './lib/betterAuthSignin.js';
import computePostActivateRedirect from './lib/computePostActivateRedirect.js';

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

  res.status(400).json({
    success: false,
    errors: { password: passwordMsg },
    message: null,
  });
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

  // With `asResponse:true`, BA wraps APIErrors as 4xx Responses instead of
  // throwing. Inspect status before attempting to read the session. The
  // `requireEmailVerification: true` config (phase 3b Lot 1) makes BA reject
  // signin with FORBIDDEN/EMAIL_NOT_VERIFIED for users who haven't clicked
  // the activation link — preserve OA legacy UX by redirecting to
  // /activate/resend in that case.
  if (!result.ok) {
    let body = {};
    try {
      body = await result.clone().json();
    } catch (err) {
      log.warn('failed to parse BA signin error body', {
        status: result.status,
        err,
      });
    }

    if (body?.code === 'EMAIL_NOT_VERIFIED') {
      const oaUser = await users
        .findOne({ query: { email: req.body.email }, detailed: true })
        .catch(() => null);
      if (oaUser) {
        return auth.redirectToResend({ req, res, user: oaUser });
      }
    }

    return signinError(req, res, body, logBundle);
  }

  let session;
  try {
    session = await authSvc.getSessionFromRequest(req, result);
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

  // Verified-linking step 2: password challenge succeeded, finalise the link
  // by handing the user back to Google. The browser still has an active
  // Google session from step 1, so the round-trip is effectively silent —
  // Google redirects without re-prompting consent. BA's /link-social
  // validates the BA session we just opened, posts a `state` carrying
  // `link.userId`, then on Google's callback it hits the `if (link)` branch
  // in callback.mjs (trustedProviders includes google → linking is allowed)
  // and finalises with a row in `account`.
  if (req.body.linkProvider === 'google') {
    const linkErrorRedirect = '/auth/signin?linkProvider=google&linkError=1';
    try {
      const linkResp = await authSvc.api.linkSocialAccount({
        body: {
          provider: 'google',
          callbackURL: '/home',
          errorCallbackURL: linkErrorRedirect,
          disableRedirect: true,
        },
        headers: authSvc.toHeaders(req, result),
        asResponse: true,
      });
      authSvc.forwardSetCookieHeaders(linkResp, res);
      const linkBody = await linkResp.json().catch(() => null);
      if (linkResp.ok && linkBody?.url) {
        if (wantsJson(req)) {
          return res.json({ success: true, redirect: linkBody.url });
        }
        return res.redirect(302, linkBody.url);
      }
      log.warn('linkSocial returned no URL', { status: linkResp.status });
    } catch (err) {
      log.error('verified linking failed', { err });
    }
    // The BA session is already open from `signInEmail` above. Sending the
    // user back to /signin?linkError=1 lets them either retry the Google
    // flow (button reappears in error mode) or proceed without linking.
    if (wantsJson(req)) {
      return res.json({ success: false, redirect: linkErrorRedirect });
    }
    return res.redirect(302, linkErrorRedirect);
  }

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

function respondSignupErrors(values) {
  if (values.resolved) return values;
  values.resolved = true;
  const errors = values.data?.errors || {};
  const message = values.data?.message || null;
  const status = Object.keys(errors).length > 0 ? 400 : 200;
  values.res.status(status).json({
    success: false,
    errors,
    message,
  });
  return values;
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

    // dead since phase 3b — requireEmailVerification:true gates signup, so
    // a freshly-created user is never `isActivated`. Kept until phase 6
    // cleanup so the legacy auto-signin path stays intact in case the BA
    // verification config is ever loosened.
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

    .then(respondSignupErrors)

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

async function activateResend(req, res) {
  const { auth: authSvc, users, sessions } = req.app.services;
  const isJson = wantsJson(req);

  if (!req.query.email) {
    if (isJson) {
      return res.status(400).json({ success: false, message: 'emailRequired' });
    }
    auth.renderEmail({ req, res, title: 'Resend activation mail' });
    return;
  }

  const optionals = _.pickBy(
    _.pick(req.query, 'invitation', 'redirect', 'agenda'),
  );

  try {
    const user = await users.findOne({
      query: { email: req.query.email },
      detailed: true,
    });

    if (!user) {
      throw new BadRequest(
        { info: { email: req.query.email } },
        'No matching account found for activation resend',
      );
    }

    if (user.isActivated) {
      throw new BadRequest(
        { info: { email: req.query.email } },
        'User is already activated, no need to activate',
      );
    }

    const callbackURL = computePostActivateRedirect({ req, optionals });

    // Issue a fresh better-auth verification token and let the
    // `onSendVerificationEmail` callback (services/auth/index.js) push the
    // mail through services.mails. Pre-3b legacy `aa` tokens still in DB
    // remain valid through the activate() façade fallback below.
    await authSvc.api.sendVerificationEmail({
      body: { email: user.email, callbackURL },
    });

    if (isJson) {
      // Always respond with a generic success on the JSON path so the
      // response cannot be used as an account-enumeration oracle (no
      // distinction between "no account", "already activated", and
      // "email re-sent"). The legacy HTML path keeps its existing flash
      // semantics for now.
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

// Sanitize the `next` query parameter for /post-activate. Only allow
// same-origin paths starting with a single `/` (so we never redirect to an
// absolute URL or protocol-relative `//evil.com`).
//
// The strict regex below restricts the allowed character set to standard
// URL path/query/fragment characters. This blocks whitespace tricks
// (`/\t//evil.com`, `/ //evil.com`) that some browsers normalise out before
// resolving the URL, as well as backslash variants (`/\\evil.com`) and any
// non-printable byte. The leading-slash and protocol-relative checks are
// kept as a belt-and-braces second gate.
function sanitizeNext(value) {
  if (typeof value !== 'string' || value.length === 0) return null;
  // Strict: leading single slash, no whitespace, no backslash, no
  // protocol-relative, only URL-safe chars in path/query/fragment.
  if (!/^\/[A-Za-z0-9_\-./?&=%~#]*$/.test(value)) return null;
  if (value.startsWith('//') || value.startsWith('/\\')) return null;
  return value;
}

// /post-activate is the intermediate hop after better-auth's auto-signin
// redirect when the original signup / activate-resend request carried an
// `invitation` token. We apply token-based invitation actions (linkMember,
// etc.) using the now-authenticated session, then redirect to either the
// agenda's contribute page (when the invitation linked the user to an
// agenda member) or the sanitized `next` path. When the user is not
// authenticated (auto-signin failed for some reason), or when no invitation
// is provided, we just redirect to `next` cleanly.
async function postActivate(req, res) {
  const { agendas, invitations, sessions } = req.app.services;

  const next = sanitizeNext(req.query?.next) || '/home';
  const invitationToken = req.query?.invitation;

  if (!req.user || !invitationToken) {
    return res.redirect(302, next);
  }

  let invitation = null;
  try {
    const result = await invitations.get(
      { token: invitationToken },
      { includeProcessed: true },
    );
    invitation = result?.invitation || null;
  } catch (err) {
    log.error('post-activate: failed to load invitation', { err });
  }

  if (!invitation) {
    return res.redirect(302, next);
  }

  // Bind the invitation to the authenticated identity. Without this, an
  // attacker authenticated as Bob could click `/post-activate?invitation=AlicesToken`
  // and have Bob linked to an agenda Alice was invited to. The invitation
  // row carries the invitee's email; require it to match req.user.email
  // (case-insensitive). When the invitation has no email at all (rare,
  // token-only invites), fall through to the legacy pass-through for
  // backwards compatibility, but log it loudly so it's auditable.
  const inviteEmail = typeof invitation.email === 'string'
    ? invitation.email.trim().toLowerCase()
    : null;
  const userEmail = typeof req.user.email === 'string'
    ? req.user.email.trim().toLowerCase()
    : null;

  if (inviteEmail) {
    if (!userEmail || inviteEmail !== userEmail) {
      log.warn(
        'post-activate: invitation email/user mismatch — refusing to apply',
        {
          invitationEmail: inviteEmail,
          userId: req.user.id,
          userEmail,
        },
      );
      return res.redirect(302, next);
    }
  } else {
    log.warn(
      'post-activate: invitation has no email, falling back to token-only pass-through',
      {
        userId: req.user.id,
        invitationToken,
      },
    );
  }

  const linkMemberActions = (invitation.data?.actions || []).filter(
    (a) => a.name === 'linkMember',
  );

  // Apply the invitation. On failure, do not redirect to /{slug}/contribute
  // — the user is not actually linked to the member row, so landing on a
  // contribute page they cannot access is misleading. Surface a flash
  // instead and redirect to the safe `next`.
  let executeFailed = false;
  try {
    await invitations.execute({ token: invitationToken }, { user: req.user });
  } catch (err) {
    executeFailed = true;
    log.error('post-activate: invitations.execute failed', { err });
    if (sessions?.setFlash) {
      sessions.setFlash(
        req,
        res,
        'Invitation could not be processed, please contact support.',
      );
    }
  }

  if (executeFailed) {
    return res.redirect(302, next);
  }

  // For linkMember invitations, prefer the agenda's contribute page so the
  // legacy UX is preserved (user lands on the agenda they were invited to).
  if (linkMemberActions.length === 1) {
    const agendaUid = linkMemberActions[0].params?.[0]?.agendaUid;
    if (agendaUid) {
      let agenda = null;
      try {
        agenda = await agendas.get({ uid: agendaUid });
      } catch (err) {
        log.error('post-activate: agendas.get failed', { agendaUid, err });
        if (sessions?.setFlash) {
          sessions.setFlash(
            req,
            res,
            'Invitation could not be processed, please contact support.',
          );
        }
        return res.redirect(302, next);
      }
      if (agenda?.slug) {
        return res.redirect(302, `/${agenda.slug}/contribute`);
      }
    }
  }

  return res.redirect(302, next);
}

// Better-auth /verify-email throws an `APIError` with a body code in
// {INVALID_TOKEN, TOKEN_EXPIRED, USER_NOT_FOUND} when the JWT is not a
// genuine BA verification token. In that case we fall through to the
// legacy `tokens` table lookup. Any other shape (network, internal error)
// is treated as a real failure and surfaced.
async function activate(req, res, next) {
  const { auth: authSvc, users, agendas, tokens, redis } = req.app.services;

  const optionals = _.pickBy(
    _.pick(req.query, 'invitation', 'redirect', 'agenda'),
  );

  const accountActivationMode = await redis.get('accountActivationMode') ?? 'manual';

  if (accountActivationMode === 'manual') {
    // Manual mode: do not consume the token at all (neither BA nor legacy);
    // an admin completes the activation out-of-band. We still try to clean
    // up a stray legacy `aa` row if one matches, preserving previous UX.
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

  // 1) Better-auth path. New verification mails (post-3b) carry a token that
  // BA can verify here. We deliberately do NOT pass `callbackURL` to
  // `verifyEmail`: when present, BA swallows errors and 302s to the URL with
  // `?error=…`, blocking our fallback.
  //
  // With `asResponse: true`, BA's better-call wraps APIErrors as Response
  // objects (4xx) instead of throwing — so we inspect status manually rather
  // than rely on try/catch. On 2xx, Set-Cookie carries the auto-signin
  // session (autoSignInAfterVerification: true). On 4xx with one of the
  // invalid-token codes, we fall through to the legacy `aa` path.
  let baResponse;
  try {
    baResponse = await authSvc.api.verifyEmail({
      query: { token: req.params.token },
      asResponse: true,
    });
  } catch (err) {
    log.error('verifyEmail threw unexpectedly', err);
    return cmn.catchError(req, res)(err);
  }

  if (baResponse.ok) {
    authSvc.forwardSetCookieHeaders(baResponse, res);
    // afterEmailVerification has already triggered runOnActivation
    // (idempotent). Auto-signin opened a session in the response cookies.
    return res.redirect(302, computePostActivateRedirect({ req, optionals }));
  }

  let baBody = {};
  try {
    baBody = await baResponse.clone().json();
  } catch (err) {
    log.warn('failed to parse BA verifyEmail error body', {
      status: baResponse.status,
      err,
    });
  }
  const baCode = baBody?.code;
  const isFallthrough = baCode === 'INVALID_TOKEN'
    || baCode === 'TOKEN_EXPIRED'
    || baCode === 'USER_NOT_FOUND';
  if (!isFallthrough) {
    log.error('verifyEmail unexpected response', {
      status: baResponse.status,
      body: baBody,
    });
    return cmn.catchError(
      req,
      res,
    )(new Error(baBody?.message || 'BA verifyEmail failed'));
  }
  // fall through to the legacy `aa` token path

  // 2) Legacy path. Mails emitted before 3b deploy carry an opaque token
  // stored in the Feathers `tokens` table. `users.activate` triggers the
  // legacy `iff(isActivated, callInterface('onActivation'))` hook which
  // calls runOnActivation (idempotent). Then we open a legacy session via
  // the existing `auth.signin` helper.
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
  const { sessions, agendas } = app.services;

  log('initing');

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
    signupSubmit,
  );

  app.post(
    '/:agendaSlug/signup',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
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
    activateResend,
  );

  app.get(
    '/:agendaSlug/activate/resend',
    agendas.mw.load,
    preMw,
    sessions.mw.ifLogged(redirectToContribute),
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

  // Post-activation hop: BA's verify-email redirects here when the original
  // signup carried an `invitation` token (see computePostActivateRedirect).
  // We expect the user to be auto-signed-in via BA, but we don't gate on it:
  // the handler degrades gracefully and redirects to `next`.
  app.get('/post-activate', preMw, postActivate);
};
