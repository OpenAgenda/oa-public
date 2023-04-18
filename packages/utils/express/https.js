'use strict';

const hsts = require('hsts');

module.exports = (req, res, next) => {
  if (!req.secure) {
    const redirectTo = 'https://' + req.hostname + req.originalUrl;

    if (req.log) {
      req.log.debug('forcing https: redirecting to %s', redirectTo);
    }

    return res.redirect(301, redirectTo);
  }

  hsts({
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  })(req, res, next);
}
