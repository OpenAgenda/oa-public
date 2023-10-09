'use strict';

const base64 = require('@openagenda/utils/base64');
const toggleCancellationInTitle = require('@openagenda/utils/cancellation/toggleTitle');
const log = require('@openagenda/logs')('services/agendaEvents/middleware/updateStatus');

module.exports = (req, res, next) => {
  const {
    core
  } = req.app.services;

  const status = parseInt(req.query.status || '1', 10);

  const payload = req.agenda.settings.lab.status ? {
    status: Number.isNaN(status) ? 1 : status
  } : {
    title: toggleCancellationInTitle(req.event.title)
  };

  log('patching event %s: %j', req.event.uid, payload);

  core
    .agendas(req.agenda.uid).events
    .patch(req.event.uid, payload, {
      userUid: req.user.uid,
      private: !!req.agenda.private,
    }).then(() => {
      res.redirect(302, req.query.redirect ? base64.decode(req.query.redirect) : `/${req.agenda.slug}/events/${req.event.slug}`);
    }, next);
};
