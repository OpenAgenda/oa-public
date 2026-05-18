import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/auth/messages.js';
import logs from '@openagenda/logs';
import { setFlash } from '../../../lib/flash.js';

const log = logs('services/sessions/load');
const getAuthMessageLabel = makeLabelGetter(labels);

function projectToLegacyShape(user, imageBucketPath) {
  if (!user) return null;
  return {
    id: user.id,
    uid: user.uid,
    name: user.fullName,
    thumbnail: user.image ? imageBucketPath + user.image : null,
    email: user.email,
    culture: user.culture,
    isNew: !!user.isNew,
    isBlacklisted: user.isBlacklisted,
    transverseApiAccess: user.transverseApiAccess,
  };
}

function blacklistRedirect(sessions, req, res, user) {
  setFlash(
    res,
    `
      <div class="text-center margin-top-sm">
        <strong>${getAuthMessageLabel('isBlacklisted', user.culture)}</strong>
        <p>${getAuthMessageLabel('isBlacklistedInfo', user.culture)}</p>
      </div>`,
  );
  sessions.close(req, () => {
    res.redirect(302, '/');
  });
}

function unauthRedirect(req, res, msg) {
  const redirectURL = Buffer.from(req.originalUrl, 'utf-8').toString('base64');
  return res.redirect(
    302,
    `${req.agenda ? `/${req.agenda.slug}` : ''}/signin?redirect=${redirectURL}&msg=${msg}`,
  );
}

// Project a BA-shaped user (already passed through resolveSessionExtras in
// services/auth/index.js, so it carries thumbnail/fullName/transverseApiAccess
// when the OA row was found) into the legacy req.user shape. Used as a
// fallback when `usersSvc.findOne({ id })` misses the row even though BA has
// an active session — observed E2E right after BA's `/api/auth/verify-email`
// auto-signin redirect. The cause has been hard to pin down (timing,
// connection-pool isolation, transactional visibility); the safe contract is
// "if BA says the visitor is signed in, trust it" rather than silently
// dropping req.user and forcing /post-activate-style flows down a no-user
// path.
function projectFromBaUser(baUser, imageBucketPath) {
  if (!baUser) return null;
  const image = baUser.image ?? null;
  return {
    id: baUser.id,
    uid: baUser.uid,
    // resolveSessionExtras carries fullName explicitly; fall back to BA's
    // raw `name` (mapped from full_name) when the OA enrichment missed.
    name: baUser.fullName ?? baUser.name ?? null,
    thumbnail: image ? imageBucketPath + image : baUser.thumbnail ?? null,
    email: baUser.email,
    culture: baUser.culture,
    isNew: !!baUser.isNew,
    isBlacklisted: !!baUser.isBlacklisted,
    transverseApiAccess: baUser.transverseApiAccess ?? false,
  };
}

function load(sessions, baseOptions, { detailed, redirect, msg } = {}) {
  const imageBucketPath = baseOptions?.imageBucketPath ?? '';
  return async (req, res, next) => {
    const auth = req.app?.services?.auth;
    const usersSvc = req.app?.services?.users;

    if (auth) {
      try {
        const ba = await auth.getSessionFromRequest(req);

        if (ba?.user) {
          let oaUser;
          try {
            oaUser = await usersSvc.findOne({
              query: { id: ba.user.id },
              detailed: true,
            });
          } catch (err) {
            log('warn', 'failed to load oa user from better-auth session', {
              userId: ba.user.id,
              err,
            });
          }

          // Blacklist guard runs against whichever shape we have. BA's
          // resolveSessionExtras enrichment already exposes `isBlacklisted`,
          // so the OA row miss path below is still covered.
          const blacklisted = oaUser
            ? oaUser.isBlacklisted
            : !!ba.user.isBlacklisted;
          if (blacklisted) {
            try {
              await auth.api.signOut({ headers: auth.toHeaders(req) });
            } catch (err) {
              log('warn', 'signOut failed for blacklisted user', { err });
            }
            return blacklistRedirect(sessions, req, res, oaUser ?? ba.user);
          }

          // Preferred path: full OA row found, project to legacy shape so the
          // `req.user.name`/`thumbnail` keys stay consistent with the legacy
          // fallback (services/sessions/interfaces/getUser.js).
          if (oaUser) {
            const projected = projectToLegacyShape(oaUser, imageBucketPath);
            req.user = projected;
            // Mirror the user onto req.session so @openagenda/sessions writes
            // it into the `oa.user` cookie. The Next.js layer reads this cookie
            // (cookies-only, no HTTP) to know whether the visitor is logged in.
            // Without this, better-auth-only sessions stay invisible to Next
            // and guards like `/auth/signin` redirect-when-logged-in don't fire.
            if (req.session) req.session.user = projected;
            return next();
          }

          // Fallback: BA confirms an active session but `usersSvc.findOne`
          // missed the row. Project the BA user (already enriched by
          // resolveSessionExtras with fullName/thumbnail/etc when its own
          // findOne succeeded) so downstream consumers — gates like
          // sessions.mw.ifLogged, the /post-activate invitation handler, the
          // `oa.user` cookie consumed by Next — still see the visitor as
          // signed in. Without this, a transient miss here silently logs the
          // user out for the duration of the request.
          const projectedFromBa = projectFromBaUser(ba.user, imageBucketPath);
          if (projectedFromBa) {
            log('warn', 'usersSvc.findOne missed; projecting from BA session', {
              userId: ba.user.id,
            });
            req.user = projectedFromBa;
            if (req.session) req.session.user = projectedFromBa;
            return next();
          }
        }
      } catch (err) {
        log('warn', 'better-auth getSession failed; falling back to legacy', {
          err,
        });
      }
    }

    sessions.get(req, { detailed }, async (err, user) => {
      if (err) return next(err);

      if (req.session?.user && !user) {
        const { sessionId } = req.session;
        req.session = sessionId ? { sessionId } : null;
      }

      if (!user && redirect) {
        return unauthRedirect(req, res, msg);
      }

      if (user && user.isBlacklisted) {
        return blacklistRedirect(sessions, req, res, user);
      }

      req.user = user;
      next();
    });
  };
}

export default load;

export function loadOrRedirect(sessions, baseOptions, options) {
  return load(sessions, baseOptions, {
    detailed: false,
    redirect: true,
    msg: 'authRequired',
    ...options,
  });
}
