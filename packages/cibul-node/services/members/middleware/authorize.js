import { NotAuthenticated } from '@openagenda/verror';
import membersSvc from '@openagenda/members';
import logs from '@openagenda/logs';

const { utils: { compareRoles: { isSuperiorTo } } } = membersSvc;

const log = logs('services/members/middleware/authorize');

export function adminModOrEventOwner(req, res, next) {
  log(
    'adminModOrEventOwner',
    req.member ? req.member.role : 'not a member',
    req.member ? req.member.userUid : '',
    req.event.uid,
  );
  if (req.member && isSuperiorTo(req.member.role, 'contributor')) {
    return next();
  } if (req.member && (req.member.userUid === req.event.ownerUid)) {
    return next();
  }
  next({
    message: 'Not authorized',
    code: 403,
  });
}

export function moderator(req, res, next) {
  if (req.member && isSuperiorTo(req.member.role, 'contributor')) {
    return next();
  }
  return next({ message: 'Not authorized', code: 403 });
}

export function moderatorCannotInviteAdministrator(req, res, next) {
  if (isSuperiorTo(req.body.role, req.member.role)) {
    return res.status(400).json({ error: 'You cannot invite administrators' });
  }
  return next();
}

export function moderatorCannotEditAdministrator(req, res, next) {
  if (req.role === 'moderator' && req.targetMember.role === 'administrator') {
    return res.status(400).json({ error: 'You cannot edit an administrator' });
  }
  return next();
}

export function adminModOrKey({ agendaUidPath } = {}) {
  return (req, res, next) => {
    const { agendas, users, members } = req.app.services;

    agendas.mw.authorizeByKey.or([
      users.mw.loadBySessionOrKey(),
      members.mw.loadAndAuthorize('moderator', {
        or: (_req, _res, n) => {
          n(new NotAuthenticated('Authentication is required'));
        },
        agendaUidPath,
      }),
    ], { agendaUidPath })(req, res, next);
  };
}
