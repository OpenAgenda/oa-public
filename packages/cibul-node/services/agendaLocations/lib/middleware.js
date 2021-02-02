'use strict';

const _ = require('lodash');

module.exports.getLocationSet = service => (req, res, next) => {
  req.locationSet = null;
  if (!req.agenda || !req.agenda.locationSetUid) {
    return next();
  }
  service.sets.get(req.agenda.locationSetUid, { detailed: true }).then(set => {
    req.locationSet = set;
    next();
  }, next);
}

module.exports.loadLocation = service => (req, res, next) => {
  service(req.agenda.uid).get(req.params.locationUid, {
    includeImagePath: true,
    eventCounts: req.query.detailed === '1'
  }).then(location => {
    if (!location) {
      return res.status(404).send();
    }
    req.location = location;
    next();
  }, next);
}

