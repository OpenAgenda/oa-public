'use strict';

const hsts = require('hsts');

module.exports = (req, res, next) => {
  const isSecure = process.env.OA_USE_X_FWD_PROTO ? req.headers['x-forwarded-proto'] === 'https' : req.secure;

  if (!isSecure) {
    const redirectTo = 'https://' + req.hostname + req.originalUrl;

    if (req.log) {
      req.log('forcing https: redirecting to %s', redirectTo);
    }

    return res.redirect(301, redirectTo);
  }

  hsts({
    maxAge: 0,
    includeSubDomains: false
  })(req, res, next);
}
