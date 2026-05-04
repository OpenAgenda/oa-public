// Reset password flow on top of better-auth.
//
// Legacy `/password/reset/:token` URLs (path-param token, lp TTL 1h) are
// 307-redirected to the new `/password/reset?token=…` query-param shape.
// Tokens issued by the pre-3b deploy are not in BA's `verification` table,
// so the form submission ultimately fails with `resetLinkOutdated` — the
// user sees the generic "lien périmé" message. We accept this minor UX
// degradation: the legacy `lp` TTL is 1h, so the window is small and adding
// a heuristic to detect "looks like a legacy token" would be brittle.
// TODO(phase 6): drop the legacy /password/reset/:token route once the
// legacy lp TTL has elapsed.

import logs from '@openagenda/logs';
import labels from '@openagenda/labels/auth/errors.js';
import makeLabelGetter from '@openagenda/labels';
import cmn from '../lib/commons-app.js';
import config from '../config/index.js';
import { wantsJson } from './lib/utils.js';

const log = logs('auth/reset.front');

const getLabel = makeLabelGetter(labels);

/**
 * controllers
 */

function lostPassword(req, res) {
  cmn.render(req, res, 'auth/lostPassword');
}

function lostPasswordSubmit(req, res) {
  const { auth, sessions } = req.app.services;

  // Instant response — zero timing leak by construction (the response does
  // not depend on the lookup result). The work runs in the background.
  // BA route: /api/auth/request-password-reset (not /forget-password). BA
  // builds the email URL to its /api/auth/reset-password/:token endpoint,
  // which 302s to `${redirectTo}?token=…` once the token is validated.
  auth.api
    .requestPasswordReset({
      body: {
        email: req.body.email,
        redirectTo: `${config.root}/password/reset`,
      },
    })
    .catch((err) => {
      log('error', 'requestPasswordReset failed', err); // never surfaced
    });

  if (wantsJson(req)) {
    res.status(200).json({ success: true });
    return;
  }
  sessions.setFlash(req, res, getLabel('passwordResetSent', req.lang));
  res.redirect(302, '/signin');
}

function resetPassword(req, res) {
  cmn.render(req, res, 'auth/resetPassword');
}

async function resetPasswordSubmit(req, res) {
  const { auth, sessions } = req.app.services;

  if (req.body.password !== req.body.repeat) {
    cmn.render(req, res, 'auth/resetPassword', {
      message: getLabel('passwordsMustMatch', req.lang),
    });
    return;
  }
  if (!req.body.password?.length) {
    cmn.render(req, res, 'auth/resetPassword', {
      message: getLabel('fieldCannotBeEmpty', req.lang),
    });
    return;
  }

  try {
    // Token comes from the query string (BA does `${redirectTo}?token=…`
    // after validation). The form has `method="post"` without an explicit
    // action, so it posts to the same URL preserving the query —
    // req.query.token is therefore also available on POST.
    await auth.api.resetPassword({
      body: { newPassword: req.body.password, token: req.query.token },
    });
    // BA has revoked sessions; password written as argon2id; user activated
    // if is_activated=0 (after-hook in Lot 1).
    sessions.setFlash(req, res, getLabel('passwordUpdated', req.lang));
    res.redirect(302, '/signin');
  } catch (err) {
    log('warn', 'resetPassword failed', err);
    cmn.render(req, res, 'auth/resetPassword', {
      message: getLabel('resetLinkOutdated', req.lang),
    });
  }
}

export default (app) => {
  const { sessions } = app.services;

  const preMw = [
    cmn.loadBaseData('oa-main.css'),
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/')),
  ];

  app.get('/password/lost', preMw, lostPassword);
  app.post('/password/lost', preMw, lostPasswordSubmit);
  // Token as query string (`?token=…`) — BA delivers the user here after
  // validating its /api/auth/reset-password/:token endpoint. The form posts
  // without an action, preserving the query, so POST also has access to the
  // token.
  app.get('/password/reset', preMw, resetPassword);
  app.post('/password/reset', preMw, resetPasswordSubmit);

  // Redirect in-flight legacy reset password links (legacy `lp` TTL: 1h) to
  // the new URL while preserving method (307) and body. The legacy token is
  // not recognized by BA, so the submission will fail with
  // "resetLinkOutdated" — degraded UX accepted on the short window. To be
  // removed in phase 6 once the legacy TTL has elapsed.
  const legacyResetRedirect = (req, res) => {
    res.redirect(
      307,
      `/password/reset?token=${encodeURIComponent(req.params.token)}`,
    );
  };
  app.get('/password/reset/:token', legacyResetRedirect);
  app.post('/password/reset/:token', legacyResetRedirect);
};
