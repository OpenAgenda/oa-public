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
    return next(new Forbidden('not authorized to create members'));
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

  req.member = req.user ? await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  }) : null;

  if (!req.member) {
    return next();
  }

  req.access = members.utils.getRoleSlug(req.member.role);

  next();
}

module.exports = {
  load,
  verify: verify.bind(null, defaultRoles),
  allow: roles => verify.bind(null, roles)
};
