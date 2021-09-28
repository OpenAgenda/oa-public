'use strict';

const marked = require('marked');
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

  sessions.setFlash(req, res, marked(getLabel('alreadyReferencedAndPublished', {
    agendaTitle: req.agenda.title,
    agendaLink: `/agendas/${req.agenda.uid}`,
    eventLink: `/agendas/${req.agenda.uid}/events/${req.params.eventUid}`
  }, req.lang)));
  res.redirect(302, `/agendas/${req.agenda.uid}/events/${req.params.eventUid}`);
}

function redirectBackWithMessage(req, res, _next) {
  const {
    sessions
  } = req.app.services;

  sessions.setFlash(req, res, marked(getLabel('alreadyReferencedAndUnpublished', {
    agendaTitle: req.agenda.title,
    agendaLink: `/agendas/${req.agenda.uid}`
  }, req.lang)));
  res.redirect(302, req.backRedirect ?? `/agendas/${req.params.fromAgendaUid}/events/${req.params.eventUid}`);
}

module.exports = Object.assign(isReferenced, {
  redirectBackWithMessage,
  redirectToSharedEventWithMessage
});
