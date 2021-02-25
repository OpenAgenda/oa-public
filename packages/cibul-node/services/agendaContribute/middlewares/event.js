'use strict';

const log = require('@openagenda/logs')('services/agendaContribute/middlewares/event');

module.exports = (req, res, next) => req.app.services.core
  .agendas((req.fromAgenda || req.agenda).uid)
  .events.get(req.params.eventUid, {
    access: 'internal',
    useDateHoursMinutesFormat: true,
    useLocationObjectFormat: true
  }).then(event => {
    if (!event) return next(404);

    req.event = event;

      next();
  }).catch(next);
