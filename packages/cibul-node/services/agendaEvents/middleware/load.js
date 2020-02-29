'use strict';

module.exports = (req, res, next) => {
  req.app.services.agendaEvents(req.agenda.uid).get(req.event.uid).then(ae => {
    if (!ae) return next({ code: 404, error: 'agendaEventNotFound' });
    req.agendaEvent = ae;
    next();
  } );
}
