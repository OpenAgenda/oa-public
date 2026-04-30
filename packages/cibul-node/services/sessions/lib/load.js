import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/auth/messages.js';
import logs from '@openagenda/logs';

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
  sessions.setFlash(
    req,
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

function load(sessions, baseOptions, { detailed, redirect, msg } = {}) {
  const imageBucketPath = baseOptions?.imageBucketPath ?? '';
  return async (req, res, next) => {
    const auth = req.app?.services?.auth;
    const usersSvc = req.app?.services?.users;

    if (auth) {
      try {
        const ba = await auth.api.getSession({
          headers: auth.toHeaders(req),
        });

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

          if (oaUser?.isBlacklisted) {
            try {
              await auth.api.signOut({ headers: auth.toHeaders(req) });
            } catch (err) {
              log('warn', 'signOut failed for blacklisted user', { err });
            }
            return blacklistRedirect(sessions, req, res, oaUser);
          }

          if (oaUser) {
            // Always project to the legacy shape — the legacy fallback below
            // also goes through services/sessions/interfaces/getUser.js which
            // projects unconditionally. Returning the full OA user here would
            // make req.user.name vs req.user.fullName depend on the auth
            // source and silently break downstream consumers.
            req.user = projectToLegacyShape(oaUser, imageBucketPath);
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
