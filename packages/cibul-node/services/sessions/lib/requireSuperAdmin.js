'use strict';

module.exports = function requireSuperAdmin(sessions, config) {
  return (req, res, next) => {
    sessions.get(req, { detailed: true }, (err, session) => {
      if (err) return next(err);

      const { id } = session;

      if (config.superAdminIds.indexOf(parseInt(id, 10)) !== -1) {
        next();
      } else {
        sessions.setFlash(req, res, 'Ah Nononon. Nononon. Non.');

        res.redirect(302, '/');
      }
    });
  };
};
