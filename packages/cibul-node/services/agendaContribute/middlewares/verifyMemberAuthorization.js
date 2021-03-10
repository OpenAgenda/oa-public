"use strict";

const _ = require('lodash');
const getLabel = require('@openagenda/labels/makeLabelGetter')(
  require('@openagenda/labels/agenda-contribute/authorization')
);
const {
  isSuperiorTo
} = require('@openagenda/members').utils.compareRoles;
const types = require('@openagenda/agendas/service/validate/contributionTypes');

const log = require('@openagenda/logs')('services/agendaContribute/middlewares/verifyMemberAuthorization');

module.exports = async (req, res, next) => {
  const {
    core
  } = req.app.services;

  if (await core.agendas(req.agenda).settings.isClosed()) {
    return next({
      code: 403,
      message: getLabel('noAccessToClosedAgenda', req.lang)
    });
  } else if (await core.agendas(req.agenda).settings.isMembersOnly() && !req.member) {
    return res.redirect(302, `/${req.agenda.slug}/request-contribute/conversation/create`);
  } else if (!req.member) {
    req.member = await core.agendas(req.agenda).members.create(req.user.uid, 'contributor');
  }
    
  req.authorizations = await core.users(req.user.uid).agendas(req.agenda.uid).getAuthorizations();

  if (!req.authorizations.canCreateEvent) {
    return next({
      code: 403,
      message: getLabel('noAccessToCreate', req.lang)
    });
  }

  next();
}


module.exports.edit = async (req, res, next) => {
  const {
    agendaEvents,
    core
  } = req.app.services;

  core 
    .users(req.user.uid)
    .agendas(req.agenda.uid)
    .getAuthorizations(req.event)
    .then(authorizations => {
      if (!['canChangeState', 'canPublish', 'canEditEvent'].filter(a => authorizations[a]).length) {
        return next({
          code: 403,
          message: getLabel('noAccessToEdit', req.lang)
        });
      }

      req.authorizations = authorizations;

      next();
    });
}