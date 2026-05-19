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

function load(sessions, baseOptions, { redirect, msg } = {}) {
  const imageBucketPath = baseOptions?.imageBucketPath ?? '';
  return async (req, res, next) => {
    const auth = req.app?.services?.auth;
    const usersSvc = req.app?.services?.users;

    if (!auth) {
      return next();
    }

    try {
      const ba = await auth.getSessionFromRequest(req);

      if (!ba?.user) {
        if (redirect) return unauthRedirect(req, res, msg);
        return next();
      }

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

      const blacklisted = oaUser
        ? oaUser.isBlacklisted
        : !!ba.user.isBlacklisted;
      if (blacklisted) {
        try {
          await auth.api.signOut({ headers: auth.toHeaders(req) });
        } catch (err) {
          log('warn', 'signOut failed for blacklisted user', { err });
        }
        return blacklistRedirect(req, res, oaUser ?? ba.user);
      }

      const projected = oaUser
        ? projectToLegacyShape(oaUser, imageBucketPath)
        : projectFromBaUser(ba.user, imageBucketPath);

      if (!oaUser && projected) {
        log('warn', 'usersSvc.findOne missed; projecting from BA session', {
          userId: ba.user.id,
        });
      }

      req.user = projected;
      // The legacy `oa.user` cookie mirror is gone: Next.js now reads the
      // BA-signed `oa.session_data` cookie cache directly. Nothing to copy
      // onto req.session here.
      return next();
    } catch (err) {
      log('warn', 'better-auth getSession failed', { err });
      if (redirect) return unauthRedirect(req, res, msg);
      return next();
    }
  };
}

export default load;

export function loadOrRedirect(sessions, baseOptions, options) {
  return load(sessions, baseOptions, {
    redirect: true,
    msg: 'authRequired',
    ...options,
  });
}
