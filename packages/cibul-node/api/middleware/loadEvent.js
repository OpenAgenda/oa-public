'use strict';

module.exports = async (req, res, next) => {
  req.app.services.events.get(req.params.eventUid, {
    private: null,
    access: 'internal',
    throwOnNotFound: true,
  }).then(event => {
    req.event = event;
    next();
  }, next);
};
