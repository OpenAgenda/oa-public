'use strict';

const log = require('@openagenda/logs')('services/eventSearch/agendaRestrictedEventSearchRoutes');
const { Router } = require('express');

module.exports = services => {
  const {
    core,
    members,
    accessTokens
  } = services;

  return Router({ mergeParams: true }).get('', (req, res, next) => {
    if (req.query.key) {
      return accessTokens.getUserFromKey(req.query.key).then(user => {
        req.user = user;
        next();
      }, err => {
        if (err.message === 'invalid key') {
          return res.status(403).json({ message: 'Invalid key' });
        }

        next(err);
      });
    }

    next();
  },(req, res, next) => {
    if (!req.user) {
      if (!req.query.key) {
        return res.status(400).json({ message: 'Access key is missing' });
      }

      return res.status(403).json({ message: 'You need to be logged' });
    }

    next();
  }, _verifyAdministratorRole.bind(null, members), (req, res, next) => {
    core.agendas(req.params.agendaUid)
      .events.search(req.query, req.query, {
        ...req.query,
        access: 'public'
      }).then(result => {
        req.result = result;
        next();
      }, next);
  }, (req, res, next) => {
    res.json(req.result);
  }, (err, req, res, next) => {
    if (err.name !== 'NotFoundError') {
      log('error', err);
      res.status(500).send();
    } else {
      res.status(404).send(null);
    }
  });
}

function _verifyAdministratorRole(members, req, res, next) {
  // need to be able to verify member before loading agenda
  members.get({
    agendaUid: req.params.agendaUid,
    userUid: req.user.uid
  }).then(member => {
    if (!member) {
      return next({
        code: 403,
        error: 'notAMember',
        message: 'Members only'
      });
    } else if (!members.utils.compareRoles.isSuperiorToOrEqual(member.role, 'moderator')) {
      return next({
        code: 403,
        error: 'unsufficientCredentials',
        message: 'Only adminmods have access'
      });
    } else {
      return next();
    }
  });
}
