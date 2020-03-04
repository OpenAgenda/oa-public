'use strict';

const log = require('@openagenda/logs')('services/agendaEvents/middleware/add');
const base64 = require('@openagenda/utils/base64');
const getLabel = require('@openagenda/labels')(require('@openagenda/labels/event/actions'));

module.exports = [(req, res, next) => {
  req.app.services.core
    .agendas(req.agenda.uid)
    .events.add(req.event.uid, {}, {
      bypassAdditionalFieldValidation: true,
      context: {
        userUid: req.user.uid
      },
      sourceAgenda: req.currentAgenda
    }).then(result => {
      req.result = result;
      next();
    }, next);
}, (req, res, next) => {
  const redirect = req.query.redirect ? base64.decode(req.query.redirect) : null;

  req.app.services.sessions.setFlash(req, res, getLabel(req.event.state === 2 ? 'agendaSharePublished' : 'agendaShareToControl', { agenda: req.agenda.title }, req.lang));

  if (redirect) {
    log('redirecting to %s', redirect);
    return res.redirect(302, redirect);
  }

  res.redirect(302, `/events/${req.event.slug}`);
}];
