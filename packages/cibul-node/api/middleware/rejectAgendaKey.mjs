import { Forbidden } from '@openagenda/verror';

export default function rejectAgendaKey(req, res, next) {
  if (req.agendaKey) {
    return next(new Forbidden('agenda key cannot be used for this route'));
  }
  next();
}