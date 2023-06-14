'use strict';

module.exports = async function removeFromHeader(req, res, next) {
  res.removeHeader('X-Frame-Options');
  next();
};
