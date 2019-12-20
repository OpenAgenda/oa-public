'use strict';

const defaultRoles = ['contributor', 'moderator', 'administrator'];

module.exports = verify.bind(null, defaultRoles);

module.exports.allow = roles => verify.bind(null, roles);

async function verify(roles, req, res, next) {
  const members = req.app.services.members;
  const { isSuperiorTo } = members.utils.compareRoles;

  const member = await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  });

  if (!member) {
    return res.status(403).json({
      error: 'user is not a member of agenda',
      agendaUid: req.params.agendaUid
    });
  }

  if (!isSuperiorTo(member.role, 'reader')) {
    return res.status(403).json({
      error: 'user is not authorized to contribute to agenda',
      agendaUid: req.params.agendaUid
    });
  }

  req.member = member;

  next();
}
