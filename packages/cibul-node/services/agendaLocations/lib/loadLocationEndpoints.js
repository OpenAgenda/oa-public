'use strict';

module.exports = service => (req, res, next) => {
  if (req.agenda.locationSetUid) {
    req.locations = service.sets(req.agenda.locationSetUid).locations;
  } else {
    req.locations = service(req.agenda.uid);
  }
  next();
}
