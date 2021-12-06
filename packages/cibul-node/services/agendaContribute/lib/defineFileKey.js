'use strict';

const uuidV4 = require('uuid/v4');

module.exports = function defineEventFileKey(req, res, next) {
  req.fileKey = req?.event?.fileKey ?? uuidV4().replace(/-/g, '');

  next();
};
