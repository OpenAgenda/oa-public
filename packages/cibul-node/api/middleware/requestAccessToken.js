'use strict';

const log = require('@openagenda/logs')('api/middleware/requestAccessToken');

module.exports = async (req, res, next) => {
  try {
    const token = await req.app.core.users({
      secretKey: req.parsedData.code
    }).generateToken();

    res.json({
      access_token: token.token,
      expires_in: token.lifespan
    });
  } catch (e) {
    res.status(401);
    res.json({
      message: e.message
    });
  }
}
