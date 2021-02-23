'use strict';

const log = require('@openagenda/logs')('services/agendaContribute/middleware/addAndRedirectIfNothingToEdit');
const base64 = require('@openagenda/utils/base64');
const getLabel = require('@openagenda/labels')(require('@openagenda/labels/event/actions'));

module.exports = (req, res, next) => {
  const additionalFieldCount = req.schemaExtensions
    .reduce((fields, schema) => fields.concat(schema.fields), [])
    .filter(f => f.fieldType !== 'abstract')
    .length;

  if (!req.authorizations.canEditEvent && !additionalFieldCount) {
    req.app.services.core
      .agendas(req.agenda.uid)
      .events.add(req.event.uid, {}, {
        userUid: req.user.uid,
        sourceAgenda: req.fromAgenda
      }).then(result => {
        const redirect = req.query.redirect ? base64.decode(req.query.redirect) : null;

        req.app.services.sessions.setFlash(req, res, getLabel(req.event.state === 2 ? 'agendaSharePublished' : 'agendaShareToControl', { agenda: req.agenda.title }, req.lang));

        if (redirect) {
          log('redirecting to %s', redirect);
          return res.redirect(302, redirect);
        }

        res.redirect(302, `/events/${req.event.slug}`);
      });

    return;
  }

  next();
}