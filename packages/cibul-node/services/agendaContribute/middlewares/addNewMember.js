'use strict';

const logs = require('@openagenda/logs');

const log = logs('services/agendaContribute/addNewMember');

module.exports = function addNewMember(req, res, next) {
  const {
    core
  } = req.app.services;

  if (req.member) {
    return next();
  }

  core.agendas(req.agenda).members.create(req.user.uid, 'contributor', {}, {
    userUid: req.user.uid
  }).then(member => {
    log('created contributor reference for user %s on agenda %s', req.user.uid, req.agenda.uid);
    req.member = member;
    next();
  });
};
