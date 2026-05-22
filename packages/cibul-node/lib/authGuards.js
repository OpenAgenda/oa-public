import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/auth/messages.js';
import logs from '@openagenda/logs';
import { setFlash } from './flash.js';

const log = logs('lib/authGuards');
const getAuthMessageLabel = makeLabelGetter(labels);

// Canonical "redirect to the signin page" action. Exported so non-guard flows
// (e.g. users/middleware/changeEmail onError) reuse the exact same URL shape
// instead of rebuilding it. Prefixes the agenda slug when one is loaded so the
// signin lands in the agenda's scope.
export function redirectToSignin(req, res) {
  const redirect = Buffer.from(req.originalUrl, 'utf-8').toString('base64');
  return res.redirect(
    302,
    `${req.agenda ? `/${req.agenda.slug}` : ''}/signin?redirect=${redirect}&msg=authRequired`,
  );
}

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

// Global session loader, mounted once (server.js / buildApp) so it runs for
// every request: reads the better-auth session into `req.user`. Anonymous
// requests fall through with no `req.user`; a blacklisted user is signed out
// and bounced to `/`. Route-level auth is then a pure presence check
// (requireUser / requireUserJson / ifLogged / ifUnlogged) with no per-route
// session re-read.
export async function loadUser(req, res, next) {
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
    return next();
  } catch (err) {
    log('warn', 'better-auth getSession failed', { err });
    return next();
  }
}

// Generic presence gates, for bespoke "not logged" responses.
export const ifLogged = (fn) => (req, res, next) =>
  (req.user ? fn(req, res, next) : next());
export const ifUnlogged = (fn) => (req, res, next) =>
  (!req.user ? fn(req, res, next) : next());

// Require an authenticated user. The global `loadUser` mount has already
// populated req.user (and bounced blacklisted users), so these are pure
// presence checks. `requireUser` is for browser/SSR routes (302 → signin);
// `requireUserJson` is for XHR/API routes (401 JSON) where a redirect would be
// useless to a fetch client.
export const requireUser = ifUnlogged(redirectToSignin);
export const requireUserJson = ifUnlogged((req, res) =>
  res.status(401).json({ error: 'Not logged' }));
