import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/auth/messages.js';

const getAuthMessageLabel = makeLabelGetter(labels);

function load(sessions, { detailed, redirect, msg } = {}) {
  return (req, res, next) => {
    sessions.get(req, { detailed }, async (err, user) => {
      if (err) return next(err);

      // session is in cookie but not in redis
      if (req.session?.user && !user) {
        const { sessionId } = req.session;
        req.session = sessionId ? { sessionId } : null;
      }

      if (!user && redirect) {
        const redirectURL = Buffer.from(req.originalUrl, 'utf-8').toString(
          'base64',
        );
        return res.redirect(
          302,
          `${req.agenda ? `/${req.agenda.slug}` : ''}/signin?redirect=${redirectURL}&msg=${msg}`,
        );
      }

      if (user && user.isBlacklisted) {
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
      } else {
        req.user = user;
        next();
      }
    });
  };
}

export default load;

export function loadOrRedirect(sessions, options) {
  return load(sessions, {
    detailed: false,
    redirect: true,
    msg: 'authRequired',
    ...options,
  });
}
