'use strict';

const _ = require('lodash');
const { Forbidden } = require('@openagenda/verror');
const log = require('@openagenda/logs')('api/middleware/member');

const {
  isSuperiorTo,
} = require('@openagenda/members').utils.compareRoles;

const defaultRoles = ['reader', 'contributor', 'moderator', 'administrator'];

async function verify(roles, req, res, next) {
  const {
    members,
  } = req.app.services;

  req.member = await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid,
  });

  if (!req.member) {
    return next(new Forbidden('not authorized for non-members'));
  }

  req.access = members.utils.getRoleSlug(req.member.role);

  if (!roles.includes(req.access)) {
    return res.status(403).json({
      error: 'user is not authorized to contribute to agenda',
      agendaUid: req.params.agendaUid,
    });
  }

  next();
}

async function load(req, _res, next) {
  const {
    members,
  } = req.app.services;

  req.member = req.user ? await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid,
  }) : null;

  if (!req.member) {
    log('not a member');
    return next();
  }

  req.access = members.utils.getRoleSlug(req.member.role);
  log('loaded member %s with access %s', req.member.userUid, req.access);

  next();
}

function moderatorCannotInviteAdministrator(req, res, next) {
  if (isSuperiorTo(req.body.role, req.member.role)) {
    return res.status(400).json({ error: 'You cannot invite administrators' });
  }
  return next();
}

function loadContext(req, res, next) {
  req.context = _.merge({
    lang: req.lang || 'fr',
    sender: {
      userUid: req.user.uid,
      memberName: _.get(req, 'member.custom.contactName') || req.user.name,
    },
    message: req.body?.message || null,
    redirect: req.body?.redirect || null,
  }, req.body.context);
  next();
}

module.exports = {
  load,
  verify: verify.bind(null, defaultRoles),
  allow: roles => verify.bind(null, roles),
  moderatorCannotInviteAdministrator,
  loadContext,
};
