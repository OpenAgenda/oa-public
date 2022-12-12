'use strict';

const _ = require('lodash');

module.exports = async (req, res, next) => {
  if (req.user) {
    return next();
  }

  try {
    req.user = await req.app.core.users.get.byAccessToken(
      _.get(req, 'headers.access-token', _.get(req, 'body.access_token')),
      _.get(req, 'headers.nonce', _.get(req, 'body.nonce')),
    );

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
