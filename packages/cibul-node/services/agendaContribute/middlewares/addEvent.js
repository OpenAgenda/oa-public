'use strict';

const marked = require('marked');
const makeLabelGetter = require('@openagenda/labels');
const log = require('@openagenda/logs')('services/agendaContribute/addEvent');
const labels = require('@openagenda/labels/agenda-contribute/share');

const filterByAuth = require('../lib/filterByAuthorizations');
const handleError = require('../lib/handleError');

const getLabel = makeLabelGetter(labels);

module.exports = function addEvent(req, res) {
  const {
    core,
    sessions,
    agendaEvents
  } = req.app.services;

  const {
    PUBLISHED
  } = agendaEvents.states;

  log('adding event %s to agenda %s', req.event.uid, req.agenda.uid);

  core.agendas(req.agenda.uid).events.add(
    req.event.uid,
    filterByAuth(core, req.agenda.uid, req.authorizations, req.dataWithFiles),
    {
      draft: false,
      userUid: req.user.uid,
      filterUnauthorizedData: true,
      sourceAgenda: req.fromAgenda
    }
  ).then(event => {
    sessions.setFlash(req, res, marked(getLabel(
      event.state === PUBLISHED ? 'sharedAndPublished' : 'sharedAndUnpublished',
      {
        agendaTitle: req.agenda.title,
        agendaLink: `/agendas/${req.agenda.uid}`,
        eventLink: `/agendas/${req.agenda.uid}/events/${req.event.uid}`
      },
      req.lang
    ), { breaks: true }));

    res.json({
      success: true,
      event
    });
  }, error => handleError({ res, log }, error));
};
