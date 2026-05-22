export default () => async (req, res, next) => {
  const { users } = req.app.services;

  const { key } = req.query;

  if (key) {
    const user = await users.findOne({ query: { key } });

    if (user) {
      req.user = user;
    }

    return next();
  }

  // No API key: req.user was already loaded from the better-auth session
  // by the global loadUser mount upstream — nothing else to do here.
  next();
};
