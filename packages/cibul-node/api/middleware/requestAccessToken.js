'use strict';

module.exports = async (req, res, next) => {
  try {
    const token = await req.app.core.users.generateToken(req.parsedData.code);

    res.json({
      access_token: token.token,
      expires_in: token.lifespan
    });
  } catch (e) {
    res.status(403);
    res.json({
      message: e.message
    });
  }
}
