'use strict';

const verifyAndLoadAccessTokenUser = require('./verifyAndLoadAccessTokenUser');

module.exports = async (req, res, next) => {
  const { accessTokens } = req.app.services;

  if (req.user) {
    return next();
  }

  if (!req.query.key && req.headers['access-token']) {
    return verifyAndLoadAccessTokenUser(req, res, next);
  }

  const isUIAPI = req.baseUrl === '/api';

  if (isUIAPI && !req.query.key) {
    return next();
  }

  try {
    req.user = await accessTokens.getUserFromKey(req.query.key);
    if (!req.user) {
      throw new Error('could not find user matching token');
    }
  } catch (e) {
    return res.status(403).json({
      error: e.message,
    });
  }

  next();
};
