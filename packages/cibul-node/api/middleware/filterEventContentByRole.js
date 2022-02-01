'use strict';

module.exports = function getEventFromSearchOrAsDraft(req, res, next) {
  req.event = req.schema.fields.reduce((event, field) => (
    !Array.isArray(field.read) || field.read.includes(req.access) ? Object.assign(
      event,
      {
        [field.field]: req.event[field.field]
      }
    ) : event
  ), {});
  next();
};
