'use strict';

const logs = require('@openagenda/logs');

const log = logs('api/middleware/requestAccessToken');

module.exports = async function requestAccessToken(req, res) {
  try {
    log('requesting accessToken for code %s', req.parsedData.code);
    const token = await req.app.core.users({
      secretKey: req.parsedData.code,
    }).generateToken();

    const expiresIn = Math.ceil((token.created_at.getTime() - new Date().getTime()) / 1000 + token.lifespan);
    log('access token generated, will expire in %s seconds', expiresIn);

    res.json({
      access_token: token.token,
      expires_in: expiresIn,
    });
  } catch (e) {
    res.status(401);
    res.json({
      message: e.message,
    });
  }
};
