'use strict';

const { Forbidden } = require('@openagenda/verror');

function evaluateUserAccessToEvent(req, res, next) {
  const {
    core
  } = req.app;

  core
    .users(req.user.uid)
    .agendas(req.agenda.uid)
    .events(req.event)
    .getContext({
      userUid: req.user.uid,
      includes: 'me.authorizations'
    })
    .then(context => {
      if (context.me.authorizations.canRead) {
        return next();
      }
      next(new Forbidden('not authorized to read event'));
    });
}

module.exports = evaluateUserAccessToEvent;
