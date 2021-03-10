'use strict';

const _ = require('lodash');

module.exports = (assignToReq = {}) => (req, res, next) => {
  if (['true', '1'].includes(_.get(req, 'query.draft', '0'))) {
    Object.assign(req, assignToReq);
  }
  next();
}