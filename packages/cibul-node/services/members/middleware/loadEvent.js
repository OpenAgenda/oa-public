'use strict';

module.exports = (req, res, next) => {
  const {
    events,
    agendaEvents
  } = req.app.services;
  events.get({ slug: req.params.eventSlug }, { private: null, internal: true }).then(event => {
    if ( !event ) return next(new Error('Event not found'));
    agendaEvents(req.agenda.uid).get(event.uid).then(ae => {
      if (!ae) {
        return next(new Error('Event is not associated with agenda'));
      }
      req.event = event;
      next();
    });
  });
}
