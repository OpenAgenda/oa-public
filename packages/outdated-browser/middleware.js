'use strict';

const { matchesUA } = require('browserslist-useragent');

function isOutdatedBrowser(userAgent, opts = {}) {
  return !matchesUA(userAgent, {
    ignoreMinor: true,
    ignorePatch: true,
    allowHigherVersions: true,
    ...opts,
  })
}

module.exports = function outdatedBrowserMw(req, res, next) {
  const userAgent = req.headers['user-agent'];

  if (!userAgent) {
    return typeof next === 'function' ? next() : null;
  }

  if (isOutdatedBrowser(userAgent)) {
    req.outdatedBrowser = true;
  }

  if (typeof next === 'function') {
    next();
  }
}

module.exports.isOutdatedBrowser = isOutdatedBrowser;
