'use strict';

const _ = require('lodash');

module.exports = (req, res, next) => {
  const requestedUid = _.get(req, 'query.oaq.uid', null);

  if (!requestedUid) return next();

  res.redirect(301, `/permalinks/events/${requestedUid}`);
};
