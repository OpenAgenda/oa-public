import logs from '@openagenda/logs';
import cmn from '../../../lib/commons-app.js';

const log = logs('superadmin/userSignin');

export default async function userSignin(req, res) {
  const { auth } = req.app.services;

  // Upstream pre-mw chain (sessions.mw.ifUnlogged + users.mw.allowSuperAdmin)
  // guarantees req.user is the superadmin and that the request carries a
  // valid BA session_token cookie for that user — `auth.impersonateUser`
  // resolves the impersonator off the headers (no need to pass it
  // explicitly).
  try {
    await auth.impersonateUser({
      targetUserId: req.loadedUser.id,
      req,
      res,
    });
  } catch (err) {
    log('error', 'impersonateUser failed', { err });
    return cmn.catchError(req, res)(err);
  }

  if (req.xhr) return cmn.renderJson(req, res, { success: true });
  return res.redirect(302, '/home');
}
