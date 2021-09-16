'use strict';

const { Forbidden } = require('@openagenda/verror');

const defaultRoles = ['reader', 'contributor', 'moderator', 'administrator'];

async function verify(roles, req, res, next) {
  const {
    members
  } = req.app.services;

  req.member = await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  });

  if (!req.member) {
    return res.status(403).json({
      error: 'user is not a member of agenda',
      agendaUid: req.params.agendaUid
    });
  }

  req.access = members.utils.getRoleSlug(req.member.role);

  if (!roles.includes(req.access)) {
    return res.status(403).json({
      error: 'user is not authorized to contribute to agenda',
      agendaUid: req.params.agendaUid
    });
  }

  next();
}

async function load(req, _res, next) {
  const {
    members
  } = req.app.services;

  req.member = await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  });

  if (!req.member) {
    return next();
  }

  req.access = members.utils.getRoleSlug(req.member.role);

  next();
}

async function verifyAccess(memberUserUidParam, req, res, next) {
  const {
    members
  } = req.app.services;

  const { isSuperiorToOrEqual } = members.utils.compareRoles;

  const memberUserUid = parseInt(req.params[memberUserUidParam], 10);

  const selfEdit = memberUserUid && (memberUserUid === req.user.uid);

  if (!isSuperiorToOrEqual(req.member.role, 'moderator') && !selfEdit) {
    return next(new Forbidden('not authorized to access requested member data'));
  }

  next();
}

function verifyRoleEdit(req, res, next) {
  const {
    members
  } = req.app.services;

  const { isSuperiorToOrEqual } = members.utils.compareRoles;

  if (!isSuperiorToOrEqual(req.member.role, req.body.role)) {
    return res.status(403).json({
      error: 'not authorized'
    });
  }

  next();
}

module.exports = {
  load,
  verify: verify.bind(null, defaultRoles),
  allow: roles => verify.bind(null, roles),
  verifyAccess: param => verifyAccess.bind(null, param),
  verifyRoleEdit
};
