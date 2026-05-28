import logs from '@openagenda/logs';
import makeLabelGetter from '@openagenda/labels';
import settingsLabels from '@openagenda/labels/users/settings.js';
import errorLabels from '@openagenda/labels/errors/index.js';
import cmn from '../lib/commons-app.js';
import { setFlash } from '../lib/flash.js';

const log = logs('auth/unlinkFacebook');

const getLabel = makeLabelGetter(settingsLabels);
const getErrorLabel = makeLabelGetter(errorLabels);

function redirectInvalid(req, res, label) {
  setFlash(res, getErrorLabel(label, req.lang));
  res.redirect(302, '/auth/signin');
}

async function confirmUnlinkFacebook(req, res) {
  const { users: usersSvc, tokens: tokensSvc, auth } = req.app.services;

  const token = await tokensSvc.findOne({
    query: { token: req.params.token, type: 'uf' },
  });

  if (!token) {
    log.info('invalid unlink-facebook token', { token: req.params.token });
    return redirectInvalid(req, res, 'unlinkFacebookError');
  }

  const user = await usersSvc.findOne({
    query: { id: token.userId },
    internal: true,
  });

  if (!user) {
    log.info('unlink-facebook token references a missing user', {
      tokenId: token.id,
      userId: token.userId,
    });
    await tokensSvc.remove(token.id);
    return redirectInvalid(req, res, 'unlinkFacebookError');
  }

  const pendingEmail = user.store?.unlinkFacebookEmail;
  const pendingPasswordHash = user.store?.unlinkFacebookPasswordHash;

  if (!pendingEmail || !pendingPasswordHash) {
    log.info('unlink-facebook token has no matching pending state', {
      userUid: user.uid,
    });
    await tokensSvc.remove(token.id);
    return redirectInvalid(req, res, 'unlinkFacebookError');
  }

  const store = { ...user.store };
  delete store.unlinkFacebookEmail;
  delete store.unlinkFacebookPasswordHash;

  await usersSvc.patch(
    user.uid,
    {
      email: pendingEmail,
      password: pendingPasswordHash,
      facebookUid: null,
      store: JSON.stringify(store),
    },
    { internal: true },
  );

  await tokensSvc.remove(token.id);

  // Drop the BA `account` row so the next /sign-in/social facebook attempt
  // hits the `disableImplicitSignUp` guard instead of silently re-linking
  // by `(provider_id, account_id)` lookup. Best-effort: any failure leaves
  // the row in place but the legacy `users.facebook_uid` is already null,
  // so the user is functionally unlinked; `accountCleanup` will pick the
  // row up on a subsequent `users.remove` if any.
  try {
    await auth?.deleteOAuthAccount?.(user.id, 'facebook');
  } catch (err) {
    log.error('failed to drop facebook account row', {
      userUid: user.uid,
      err,
    });
  }

  log.info(
    'migration complete, facebook unlinked and email/password persisted',
    { userUid: user.uid },
  );

  setFlash(res, getLabel('unlinkFacebookSuccess', req.lang));

  if (req.user && req.user.uid === user.uid) {
    // Same-session click: keep the user signed in and drop them back on
    // their settings screen.
    return res.redirect(302, '/settings');
  }

  // Different device or expired session: send them to /auth/signin so they
  // can log in with their new email + password.
  return res.redirect(302, '/auth/signin');
}

export default (app) => {
  app.get(
    '/unlinkFacebook/:token',
    cmn.loadBaseData('oa-main.css'),
    (req, res, next) => confirmUnlinkFacebook(req, res).catch(next),
  );
};
