'use strict';

module.exports = async (req, res, next) => {
  // user can edit event if he is the creator or if the agenda is the origin agenda of the event

  if (req.event.ownerUid === req.user.uid) return next();

  if (req.event.agendaUid === req.agenda.uid) return next();

  return res.status(403).json( {
    error: 'user is not the owner of the event, agenda is not the origin',
    agendaUid: req.params.agendaUid,
    eventUid: req.params.eventUid
  });
}
