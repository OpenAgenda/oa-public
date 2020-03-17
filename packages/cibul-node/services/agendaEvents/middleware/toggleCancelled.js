'use strict';

const base64 = require('@openagenda/utils/base64');
const toggleCancellationInTitle = require('@openagenda/utils/cancellation/toggleTitle');

module.exports = (req, res, next) => {
  req.app.services.core.agendas(req.agenda.uid).events.patch(req.event.uid, {
    title: toggleCancellationInTitle(req.event.title)
  }).then(result => {
    res.redirect(302, req.query.redirect ? base64.decode(req.query.redirect) : `/${req.agenda.slug}/events/${req.event.slug}`);
  }, next);
}
