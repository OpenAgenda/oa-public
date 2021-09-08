'use strict';

const makeLabelGetter = require('@openagenda/labels');
const labels = require('@openagenda/labels/agenda-contribute/share');

const getLabel = makeLabelGetter(labels);

function isReferenced({ andPublished, andNotPublished }) {
  return (req, res, next) => {
    const {
      agendaEvents
    } = req.app.services;

    const {
      PUBLISHED
    } = agendaEvents.states;

    agendaEvents(req.agenda.uid).get(req.params.eventUid).then(ae => {
      if (!ae) return next();

      if (ae.state === PUBLISHED) {
        return andPublished(req, res, next);
      }
      andNotPublished(req, res, next);
    }, next);
  };
}

function redirectToSharedEventWithMessage(req, res, _next) {
  const {
    sessions
  } = req.app.services;

  sessions.setFlash(req, res, getLabel('alreadyReferencedAndPublished', {
    agenda: req.agenda.title
  }, req.lang));
  res.redirect(302, `/agendas/${req.agenda.uid}/events/${req.params.eventUid}`);
}

function redirectBackWithMessage(req, res, _next) {
  const {
    sessions
  } = req.app.services;

  sessions.setFlash(req, res, getLabel('alreadyReferencedAndUnpublished', {
    agenda: req.agenda.title
  }, req.lang));
  res.redirect(302, req.backRedirect ?? `/agendas/${req.params.fromAgendaUid}/events/${req.params.eventUid}`);
}

module.exports = Object.assign(isReferenced, {
  redirectBackWithMessage,
  redirectToSharedEventWithMessage
});
