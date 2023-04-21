'use strict';

const _ = require('lodash');
const { Forbidden, NotFound } = require('@openagenda/verror');
const log = require('@openagenda/logs')('services/agendaContribute/loadMember');

module.exports = function loadMember(req, res, next) {
  const {
    members
  } = req.app.services;

  log('getting member for user %s in agenda %s', _.get(req, 'user.uid'), _.get(req, 'agenda.uid'));

  const userUid = _.get(req, 'user.uid');
  const agendaUid = _.get(req, 'agenda.uid');

  if (!userUid) return next(new Forbidden());
  if (!agendaUid) return next(new NotFound());

  members.get({ agendaUid, userUid }).then(member => {
    req.member = member ? {
      ..._.get(member, 'custom'),
      role: members.utils.getRoleSlug(member.role)
    } : null;
    next();
  }, next);
};
