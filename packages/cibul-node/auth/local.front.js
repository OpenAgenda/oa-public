import fs from 'node:fs';
import _ from 'lodash';
import logs from '@openagenda/logs';
import flattenLabels from '@openagenda/labels/flatten.js';
import makeLabelGetter from '@openagenda/labels';
import manualLabels from '@openagenda/labels/auth/manual.js';
import { fromMarkdownToHTML } from '@openagenda/md';
import cmn from '../lib/commons-app.js';
import layouts from '../services/lib/layouts/index.js';
import * as auth from './lib/auth.js';
import computePostActivateRedirect from './lib/computePostActivateRedirect.js';

const log = logs('auth/local');

const getLabel = makeLabelGetter(manualLabels);

const manualTemplate = _.template(
  fs.readFileSync(`${import.meta.dirname}/manual.tpl`, 'utf-8'),
);

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

// Phase 6 lot 2/4 — the legacy `signin` / `signup` / `password/*` /
// `activate/resend` Express wrappers were retired. The Next forms now post
// directly to BA endpoints (`/api/auth/sign-in/email`, `/api/auth/sign-up/email`,
// `/api/auth/request-password-reset`, `/api/auth/reset-password`,
// `/api/auth/sign-in/social`, `/api/auth/send-verification-email`). The
// handlers below cover the routes that remain OA-specific:
//   - `/signup/complete`        (post-signup confirmation page, EJS)
//   - `/activate/:token`        (manual mode + legacy `aa` fallback)
//   - `/post-activate`          (invitation hop after BA auto-signin)

function signupComplete(req, res) {
  cmn.render(req, res, 'auth/activation', {
    indexed: false,
    agenda: req.agenda,
    email: req.query.email,
  });
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

// Phase 6 lot 3 — the legacy `aa` token fallback was retired. New
// verification mails carry a better-auth token verified through
// `auth.api.verifyEmail`. Pre-3b legacy `aa` tokens have a short TTL (a few
// days/weeks) that has fully expired by the time this lot ships; the
// activate() façade is now BA-only.
//
// Manual activation mode (custom OA) is preserved: under that flag the
// token is not consumed and an admin completes activation out-of-band.
async function activate(req, res) {
  const { auth: authSvc, redis } = req.app.services;

  const optionals = _.pickBy(
    _.pick(req.query, 'invitation', 'redirect', 'agenda'),
  );

  const accountActivationMode = await redis.get('accountActivationMode') ?? 'manual';

  if (accountActivationMode === 'manual') {
    // Manual mode: do not consume the token at all; an admin completes the
    // activation out-of-band. The legacy `aa` row cleanup that used to live
    // here was removed in lot 3 cleanup — the legacy chain is dead and
    // residual rows are tracked for a dedicated DB cleanup migration.
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

  // Better-auth path. We deliberately do NOT pass `callbackURL` to
  // `verifyEmail`: when present, BA swallows errors and 302s to the URL with
  // `?error=…`, which would mask invalid-token reporting in our UX.
  //
  // With `asResponse: true`, BA's better-call wraps APIErrors as Response
  // objects (4xx) instead of throwing — so we inspect status manually rather
  // than rely on try/catch. On 2xx, Set-Cookie carries the auto-signin
  // session (autoSignInAfterVerification: true).
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
  const isInvalidToken = baCode === 'INVALID_TOKEN'
    || baCode === 'TOKEN_EXPIRED'
    || baCode === 'USER_NOT_FOUND';

  if (isInvalidToken) {
    return auth.renderInvalidActivation(req, res);
  }

  log.error('verifyEmail unexpected response', {
    status: baResponse.status,
    body: baBody,
  });
  return cmn.catchError(
    req,
    res,
  )(new Error(baBody?.message || 'BA verifyEmail failed'));
}

export default (app) => {
  const { sessions, agendas } = app.services;

  log('initing');

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
