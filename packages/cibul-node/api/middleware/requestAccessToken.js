'use strict';

module.exports = async function requestAccessToken(req, res) {
  try {
    const token = await req.app.core.users({
      secretKey: req.parsedData.code
    }).generateToken();

    res.json({
      access_token: token.token,
      expires_in: Math.ceil((token.created_at.getTime() - (new Date()).getTime()) / 1000 + token.lifespan)
    });
  } catch (e) {
    res.status(401);
    res.json({
      message: e.message
    });
  }
};
