"use strict";

const _ = require('lodash');

const getLabel = require('@openagenda/labels/makeLabelGetter')(
  require('@openagenda/labels/members')
);
const log = require('@openagenda/logs')('services/members/middleware/loadMember');

module.exports = (req, res, next) => {
  log('loading current user member reference');
  _load({ agendaUidPath: 'agenda.uid' }, req).then(next, next);
}

module.exports.andAuthorize = (requiredRole, options = {}) => {
  const orFn = _.get(options, 'or', (req, res) => {
    const { sessions } = req.app.services;

    if (!req.member) {
      sessions.setFlash(req, res, getLabel('memberRequired', req.lang))
      res.redirect(302, `/${req.agenda.slug}`);
    } else {
      sessions.setFlash(req, res, getLabel('roleInsufficient', req.lang))
      res.redirect(302, `/${req.agenda.slug}`);
    }
  });

  return (req, res, next) => {
    log('load and authorize', requiredRole);

    const { members } = req.app.services;
    const { isSuperiorToOrEqual } = members.utils.compareRoles;

    _load(options, req).then(() => {

      if (req.member && isSuperiorToOrEqual(req.member.role, requiredRole)) {
        next();
      } else {
        orFn(req, res, next);
      }
    }, next);
  }
}

module.exports.or = orFn => (req, res, next) => {
  _load({ agendaUidPath: 'agenda.uid' }, req).then(() => {
    if (!req.member) return orFn(req, res, next);
    next();
  }, next);
}

module.exports.orFail = (req, res, next) => {
  log('loading current user member reference... or fail');
  _load({ agendaUidPath: 'agenda.uid' }, req).then(() => {
    if (!req.member) {
      res.status(403);
      return next(new Error('Not a member'));
    }
    next();
  }, next);
}

async function _load({ agendaUidPath }, req) {
  const { members } = req.app.services;
  const agendaUid = _.get(req, agendaUidPath || 'agenda.uid');

  if (!req.user) {
    return;
  }

  const member = await members.get({
    agendaUid,
    userUid: req.user.uid
  });

  req.member = member
}
