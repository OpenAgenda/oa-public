'use strict';

const { NotAuthenticated } = require('@openagenda/verror');
const getLabel = require('@openagenda/labels/makeLabelGetter')(
  require('@openagenda/labels/agenda-contribute/authorization')
);

module.exports = async (req, res, next) => {
  const {
    core,
    members: {
      utils: {
        compareRoles: {
          isInferiorTo
        }
      }
    }
  } = req.app.services;

  if (!req.user) {
    return next(new NotAuthenticated('Authentication is required'));
  }

  if (await core.agendas(req.agenda).settings.isClosed() && isInferiorTo(req.member?.role, 'moderator')) {
    return next({
      code: 403,
      message: getLabel('noAccessToClosedAgenda', req.lang)
    });
  }

  if (await core.agendas(req.agenda).settings.isMembersOnly() && !req.member) {
    return res.redirect(302, `/${req.agenda.slug}/request-contribute/conversation/create`);
  }

  if (!req.member) {
    req.member = await core.agendas(req.agenda).members.create(req.user.uid, 'contributor', {}, {
      userUid: req.user.uid
    });
  }

  req.authorizations = await core.users(req.user.uid).agendas(req.agenda.uid).getAuthorizations();

  if (!req.authorizations.canCreateEvent) {
    return next({
      code: 403,
      message: getLabel('noAccessToCreate', req.lang)
    });
  }

  next();
};

module.exports.edit = async (req, res, next) => {
  const {
    core
  } = req.app.services;

  core
    .users(req.user.uid)
    .agendas(req.agenda.uid)
    .getAuthorizations(req.event)
    .then(authorizations => {
      if (!['canChangeState', 'canPublish', 'canEditEvent', 'canContribute'].filter(a => authorizations[a]).length) {
        return next({
          code: 403,
          message: getLabel('noAccessToEdit', req.lang)
        });
      }

      req.authorizations = authorizations;

      next();
    });
};
