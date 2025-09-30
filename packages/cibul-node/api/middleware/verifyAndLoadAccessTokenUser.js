function extractAccessToken(req) {
  let token;

  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer tk-')) {
    token = authHeader.slice(7);
  }
  if (!token) {
    token = req.headers?.['access-token'];
  }
  if (!token) {
    token = req.body?.access_token;
  }
  return token;
}

export default async (req, res, next) => {
  if (req.user) {
    return next();
  }

  try {
    const accessToken = extractAccessToken(req);

    req.user = await req.app.core.users.get.byAccessToken(accessToken);

    if (!req.user) {
      throw new Error('could not find user matching token');
    }
  } catch (e) {
    if (e.code === 400) {
      return next(e);
    }

    return res.status(403).json({
      error: e.message,
    });
  }

  next();
};
