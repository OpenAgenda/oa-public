export default function requireSuperAdmin(sessions, config) {
  return (req, res, next) => {
    sessions.get(req, { detailed: true }, (err, session) => {
      if (err) return next(err);

      const { id } = session;

      if (config.superAdminIds.includes(parseInt(id, 10))) {
        next();
      } else {
        sessions.setFlash(req, res, 'Ah Nononon. Nononon. Non.');

        res.redirect(302, '/');
      }
    });
  };
};
