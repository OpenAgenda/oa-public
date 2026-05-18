import _ from 'lodash';
import qs from 'qs';
import logs from '@openagenda/logs';
import cmn from '../lib/commons-app.js';
import { setFlash } from '../lib/flash.js';
import computePostActivateRedirect from './lib/computePostActivateRedirect.js';

const log = logs('auth/local');

const preMw = [cmn.loadBaseData('oa-main.css')];

function redirectToContribute(req, res) {
  res.redirect(302, `/${req.agenda.slug}/contribute`);
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

// /post-activate is the intermediate hop after better-auth's verifyEmail
// redirect. It is the single landing point for the verify-email callbackURL
// (see auth/lib/computePostActivateRedirect.js for why we route everything
// through it instead of going straight to /home or /{slug}/contribute).
//
// Three cases:
//   1. BA reported an error (`?error=INVALID_TOKEN|TOKEN_EXPIRED|USER_NOT_FOUND|…`)
//      — surface the legacy "invalid activation link" page through the
//      Next signin form (`/auth/signin?msg=invalidActivation[&agenda=<slug>]`).
//   2. The original signup carried an `invitation` token — apply the
//      token-based invitation actions (linkMember, etc.) using the
//      now-authenticated session, then redirect to the agenda's contribute
//      page (when the invitation linked the user to an agenda member) or
//      the sanitized `next` path.
//   3. No error and no invitation — redirect to `next` cleanly.
//
// When the user is not authenticated (auto-signin failed for some reason),
// we still degrade gracefully and redirect to `next`.
async function postActivate(req, res) {
  const { agendas, invitations } = req.app.services;

  const next = sanitizeNext(req.query?.next) || '/home';

  // BA `verifyEmail` posts `?error=<CODE>` on the callbackURL when the token
  // is rejected. The exhaustive list (BASE_ERROR_CODES branch in
  // node_modules/better-auth/dist/api/routes/email-verification.mjs):
  //   - TOKEN_EXPIRED   (JWT past `expiresIn`)
  //   - INVALID_TOKEN   (JWT signature / payload invalid)
  //   - USER_NOT_FOUND  (token's `email` claim has no matching user row)
  //   - INVALID_USER    (change-email confirmation hits a different session)
  // All four map to the same UX as the legacy façade did: the signin form
  // with `?msg=invalidActivation`. We treat any non-empty `?error=` as
  // invalid-token to keep the matrix forward-compatible (BA could add new
  // codes; mapping unknowns to the same generic banner is the safer default).
  if (typeof req.query?.error === 'string' && req.query.error.length > 0) {
    // Phase 6 lot 6 — when the activation came from an agenda-aware link
    // (`?agenda=<slug>` carried through the BA verifyEmail callbackURL),
    // surface the invalidActivation banner inside the agenda-show page
    // instead of the neutral `/auth/signin`. The agenda-show page mounts
    // <InvitationAuthDialog> which reads `?auth=signin&msg=invalidActivation`
    // and opens AuthDialog with the banner already populated.
    const slug = typeof req.query?.agenda === 'string' && req.query.agenda.length > 0
      ? req.query.agenda
      : null;
    if (slug) {
      const query = { auth: 'signin', msg: 'invalidActivation' };
      return res.redirect(
        302,
        `/${slug}${qs.stringify(query, { addQueryPrefix: true })}`,
      );
    }
    return res.redirect(
      302,
      `/auth/signin${qs.stringify({ msg: 'invalidActivation' }, { addQueryPrefix: true })}`,
    );
  }

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
    setFlash(res, 'Invitation could not be processed, please contact support.');
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
        setFlash(
          res,
          'Invitation could not be processed, please contact support.',
        );
        return res.redirect(302, next);
      }
      if (agenda?.slug) {
        return res.redirect(302, `/${agenda.slug}/contribute`);
      }
    }
  }

  return res.redirect(302, next);
}

// Phase 6 lot 5 — the in-process `auth.api.verifyEmail` call was retired.
// The handler is now a pure 302 proxy to BA's HTTP `/api/auth/verify-email`
// endpoint, which handles cookie-setting, error redirects (`?error=<CODE>`),
// and auto-signin natively. The single landing point for the BA callbackURL
// is `/post-activate`, which intercepts BA errors and surfaces them as
// `/auth/signin?msg=invalidActivation`.
//
// Manual activation mode (custom OA) is preserved: under that flag the
// token is not consumed and an admin completes activation out-of-band.
//
// In practice no new email points to `/activate/:token` anymore — phase 3b
// switched the verification mail to BA's native URL (`${baseURL}/api/auth/verify-email?…`).
// This handler keeps the route alive for old-emails-in-flight and external
// links (CMS, documentation) while we phase the path out entirely.
async function activate(req, res) {
  const { redis } = req.app.services;

  const accountActivationMode = await redis.get('accountActivationMode') ?? 'manual';

  if (accountActivationMode === 'manual') {
    return res.redirect(302, '/auth/manual');
  }

  const optionals = _.pickBy(
    _.pick(req.query, 'invitation', 'redirect', 'agenda'),
  );
  const callbackURL = computePostActivateRedirect({ req, optionals });
  const verifyURL = `/api/auth/verify-email?${qs.stringify({
    token: req.params.token,
    callbackURL,
  })}`;
  return res.redirect(302, verifyURL);
}

export default (app) => {
  const { sessions, agendas } = app.services;

  log('initing');

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

  // Post-activation hop: BA's verify-email always redirects here (see
  // computePostActivateRedirect for the rationale). Handles three cases:
  //   - `?error=<CODE>` (BA token rejection) → /auth/signin?msg=invalidActivation
  //   - `?invitation=<token>` → apply invitation, then redirect
  //   - otherwise → redirect to sanitized `next` (default /home)
  // We expect the user to be auto-signed-in via BA, but we don't gate on it:
  // the handler degrades gracefully and redirects to `next`.
  app.get('/post-activate', preMw, postActivate);
};
