'use strict';

module.exports = async (req, res, next) => {
  const { accessTokens } = req.app.services;

  try {
    req.user = await accessTokens.getUserFromKey(req.query.key);

    if (!req.user) throw new Error('could not find user matching token');
  } catch(e) {
    return res.status(403).json( {
      error: e.message
    });
  }

  next();
}
