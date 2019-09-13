"use strict";

const _ = require('lodash');

const getLabel = require('@openagenda/labels/makeLabelGetter')(
  require('@openagenda/labels/members')
);
const {
  isSuperiorToOrEqual
} = require('@openagenda/members').utils.compareRoles;
const log = require('@openagenda/logs')('services/members/middleware/loadMember');

const sessions = require('../../sessions');

module.exports = (members, req, res, next) => {
  log( 'loading current user member reference' );
  _load( members, { agenda: 'agenda' }, req ).then( next, next );
}

module.exports.andAuthorize = (members, requiredRole, options = {}) => {
  const orFn = _.get( options, 'or', (req, res) => {
    if (!req.member) {
      sessions.setFlash(req, res, getLabel('memberRequired', req.lang))
      res.redirect(302, `/${req.agenda.slug}`);
    } else {
      sessions.setFlash(req, res, getLabel('roleInsufficient', req.lang))
      res.redirect(302, `/${req.agenda.slug}`);
    }
  });

  return (req, res, next) => {
    log( 'load and authorize', requiredRole );
    _load(members, options, req).then(() => {
      if (req.member && isSuperiorToOrEqual(req.member.role, requiredRole)) {
        next();
      } else {
        orFn(req, res, next);
      }
    });
  }
}

module.exports.or = (members, orFn) => (req, res, next) => {
  _load(members, {agendaNamespace: 'agenda'}, req).then(() => {
    if (!req.member) return orFn(req, res, next);
    next();
  });
}

module.exports.orFail = (members, req, res, next) => {
  log( 'loading current user member reference... or fail' );
  _load(members, {agendaNamespace: 'agenda'}, req).then( () => {
    if (!req.member) {
      res.status(403);
      return next(new Error('Not a member'));
    }
    next();
  } );
}

async function _load(members, {agendaNamespace}, req) {
  if (!req.user) return;
  return members.get( {
    agendaUid: _.get(req, agendaNamespace || 'agenda').uid,
    userUid: req.user.uid
  } ).then( member => {
    req.member = member;
  } );
}
