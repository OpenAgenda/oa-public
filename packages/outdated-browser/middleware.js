'use strict';

const { matchesUA } = require('browserslist-useragent');

module.exports = function outdatedBrowserMw(req, res, next) {
  const userAgent = req.headers['user-agent'];
  const outdatedBrowser = !matchesUA(userAgent, {
    ignoreMinor: true,
    ignorePatch: true,
    allowHigherVersions: true
  });

  if (outdatedBrowser) {
    req.outdatedBrowser = true;
  }

  if (typeof next === 'function') {
    next();
  }
}
