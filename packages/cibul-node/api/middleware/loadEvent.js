'use strict';

module.exports = async (req, res, next) => {
  req.app.services.events.get({ uid: req.params.eventUid }, {
    private: null,
    internal: true
  }, (err, event) => {
    if (err) return next(err);

    if (!event) {
      return res.status(404).json({
        error: 'event not found',
        agendaUid: req.params.agendaUid
      });
    }

    req.event = event;

    next();
  });
}
