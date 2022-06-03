'use strict';

const { Forbidden } = require('@openagenda/verror');
const log = require('@openagenda/logs')('api/middleware/getEventFromSearchOrAsDraft');

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
    return next(new Forbidden('not authorized for non-members'));
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
    log('not a member');
    return next();
  }

  req.access = members.utils.getRoleSlug(req.member.role);
  log('loaded member %s with access %s', req.member.userUid, req.access);

  next();
}

module.exports = {
  load,
  verify: verify.bind(null, defaultRoles),
  allow: roles => verify.bind(null, roles)
};
