'use strict';

const _ = require('lodash');

module.exports = (req, res, next) => {
  if (!req.query.locationSet) return next();
  
  req.app.services.agendaLocations.sets.get(req.query.locationSet).then(locationSet => {
    if (!locationSet) return next();

    req.locationSet = _.pick(locationSet, ['uid', 'title']);

    next();
  }, next);
}
