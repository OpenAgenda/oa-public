// Loads `req.user` from a `?key=` query param (in addition to whatever the
// session middleware already populated). Used by the legacy UI shares that
// hand out a user's key in a URL. The verify path is the better-auth `apikey`
// store via the `@openagenda/auth` façade; only user-owned keys hydrate
// `req.user` (an agenda key resolves elsewhere — `agendas.mw.authorizeByKey`).
export default () => async (req, res, next) => {
  if (req.user) return next();

  const { key } = req.query;
  if (!key) return next();

  try {
    const verified = await req.app.services.auth.verifyKey(key);
    if (verified?.owner?.kind === 'user') {
      const user = await req.app.core.users.get(verified.owner.userUid, {
        detailed: true,
      });
      if (user && !user.isBlacklisted) {
        req.user = user;
      }
    }
  } catch (_err) {
    // Anonymous fall-through on any auth-store hiccup — the legacy lookup
    // swallowed errors the same way.
  }

  next();
};
