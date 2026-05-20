import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/auth/messages.js';
import logs from '@openagenda/logs';
import { setFlash } from '../../../lib/flash.js';

const log = logs('services/sessions/load');
const getAuthMessageLabel = makeLabelGetter(labels);

function blacklistRedirect(req, res, user) {
  setFlash(
    res,
    `
      <div class="text-center margin-top-sm">
        <strong>${getAuthMessageLabel('isBlacklisted', user.culture)}</strong>
        <p>${getAuthMessageLabel('isBlacklistedInfo', user.culture)}</p>
      </div>`,
  );
  res.redirect(302, '/');
}

function unauthRedirect(req, res, msg) {
  const redirectURL = Buffer.from(req.originalUrl, 'utf-8').toString('base64');
  return res.redirect(
    302,
    `${req.agenda ? `/${req.agenda.slug}` : ''}/signin?redirect=${redirectURL}&msg=${msg}`,
  );
}

function load(sessions, options) {
  const { redirect, msg } = options ?? {};
  return async (req, res, next) => {
    const auth = req.app?.services?.auth;

    if (!auth) {
      return next();
    }

    try {
      // `disableCookieCache` forces a session read past BA's 1h-cached cookie
      // payload, so a revoked session (revokeUserSessions deletes the Redis
      // record) is seen immediately on the next request.
      const ba = await auth.getSessionFromRequest(req, undefined, {
        disableCookieCache: true,
      });

      if (!ba?.user) {
        if (redirect) return unauthRedirect(req, res, msg);
        return next();
      }

      // Belt-and-suspenders: the real protection against a blacklisted user is
      // session revocation (services/users/hooks/accountCleanup.js → getSession
      // returns null). The snapshot is also kept fresh on every mirrored-field
      // patch (refreshUserSessions), so `ba.user.isBlacklisted` is trustworthy
      // for the rare out-of-band case — no per-request DB read needed.
      if (ba.user.isBlacklisted) {
        try {
          await auth.api.signOut({ headers: auth.toHeaders(req) });
        } catch (err) {
          log('warn', 'signOut failed for blacklisted user', { err });
        }
        return blacklistRedirect(req, res, ba.user);
      }

      // BA serialises `id` as a string (its adapter String()-coerces the PK on
      // output regardless of the numeric `serial` column). Coerce back to a
      // number so the prior contract holds for consumers that store/query it
      // (e.g. agendas `ownerId`, users.findOne({ id })). `uid` is a BIGINT
      // additional field returned as a JS number — left untouched.
      req.user = { ...ba.user, id: Number(ba.user.id) };
      // The legacy `oa.user` cookie mirror is gone: Next.js now reads the
      // BA-signed `oa.sess_data` session cache directly. Nothing to copy onto
      // req.session here.
      return next();
    } catch (err) {
      log('warn', 'better-auth getSession failed', { err });
      if (redirect) return unauthRedirect(req, res, msg);
      return next();
    }
  };
}

export default load;

export function loadOrRedirect(sessions, options) {
  return load(sessions, {
    redirect: true,
    msg: 'authRequired',
    ...options,
  });
}
