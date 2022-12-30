'use strict';

module.exports = async (req, res, next) => {
  if (req.user) {
    return next();
  }

  try {
    req.user = await req.app.core.users.get.byAccessToken(
      req.headers?.['access-token'] ?? req.body?.access_token,
      req.headers?.nonce ?? req.body?.nonce,
    );

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
