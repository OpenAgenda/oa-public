'use strict';

const _ = require('lodash');

module.exports = (req, res, next) => {
  if (!req.query.network) return next();

  req.app.services.networks.get(req.query.network).then(network => {
    if (!network) return next();

    req.network = _.pick(network, ['uid', 'title']);

    next();
  }, next);
};
