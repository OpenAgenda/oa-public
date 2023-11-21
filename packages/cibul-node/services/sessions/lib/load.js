'use strict';

const getAuthMessageLabel = require('@openagenda/labels')(require('@openagenda/labels/auth/messages'));

function load(sessions, { detailed, redirect, msg } = {}) {
  return (req, res, next) => {
    sessions.get(req, { detailed }, (err, user) => {
      if (err) return next(err);
      if (!user && redirect) {
        const redirectURL = Buffer.from(req.originalUrl, 'utf-8').toString('base64');
        return res.redirect(302, `${req.agenda ? `/${req.agenda.slug}` : ''}/signin?redirect=${redirectURL}&msg=${msg}`);
      }

      if (user && user.isBlacklisted) {
        sessions.setFlash(req, res, `
          <div class="text-center margin-top-sm">
            <strong>${getAuthMessageLabel('isBlacklisted', user.culture)}</strong>
            <p>${getAuthMessageLabel('isBlacklistedInfo', user.culture)}</p>
          </div>`);
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

module.exports = load;

module.exports.loadOrRedirect = function loadOrRedirect(sessions, options) {
  return load(sessions, {
    detailed: false,
    redirect: true,
    msg: 'authRequired',
    ...options,
  });
};
