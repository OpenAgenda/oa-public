'use strict';

const marked = require('marked');
const log = require('@openagenda/logs')('services/agendaContribute/middleware/addAndRedirectIfNothingToEdit');
const base64 = require('@openagenda/utils/base64');
const makeLabelGetter = require('@openagenda/labels');
const labels = require('@openagenda/labels/agenda-contribute/share');

const getLabel = makeLabelGetter(labels);

module.exports = (req, res, next) => {
  const {
    agendaEvents,
    sessions
  } = req.app.services;

  const {
    PUBLISHED
  } = agendaEvents.states;

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

        const {
          state
        } = result;

        sessions.setFlash(req, res, marked(
          getLabel(state === PUBLISHED ? 'sharedAndPublished' : 'sharedAndUnpublished', {
            agendaTitle: req.agenda.title,
            agendaLink: `/agendas/${req.agenda.uid}`,
            eventLink: `/agendas/${req.agenda.uid}/events/${req.event.uid}`
          }, req.lang),
          { breaks: true }
        ));

        if (redirect) {
          log('redirecting to %s', redirect);
          return res.redirect(302, redirect);
        }

        res.redirect(302, `/events/${req.event.slug}`);
      });

    return;
  }

  next();
};
