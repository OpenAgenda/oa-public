import { Forbidden, NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';

const log = logs('services/agendaContribute/loadMember');

export default function loadMember(req, res, next) {
  const { members } = req.app.services;

  const userUid = req.user?.uid;
  const agendaUid = req.agenda?.uid;

  log('getting member for user %s in agenda %s', userUid, agendaUid);

  if (!userUid) return next(new Forbidden());
  if (!agendaUid) return next(new NotFound());

  members.get({ agendaUid, userUid }).then((member) => {
    req.member = member
      ? {
        ...member.custom,
        role: members.utils.getRoleSlug(member.role),
      }
      : null;
    next();
  }, next);
}
