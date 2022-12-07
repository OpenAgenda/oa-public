'use strict';

const express = require('express');

const loadAgendaMw = require('../members/middleware/loadAgenda');
const loadEventMw = require('../members/middleware/loadEvent');
const changeStateMw = require('./middleware/changeState');
const removeMw = require('./middleware/remove');
const changeFeaturedMw = require('./middleware/changeFeatured');
const updateStatusMw = require('./middleware/updateStatus');
const batchMw = require('./middleware/batch');
const navigateMw = require('./middleware/navigate');
const loadAgendaEventMw = require('./middleware/load');

module.exports = function plugApp(parentApp) {
  const {
    sessions,
    members,
    agendas,
  } = parentApp.services;

  const requireLoggedMw = sessions.mw.ifUnlogged((req, res, next) => next({
    code: 403,
    error: 'requiredLogged',
    message: 'You need to be logged',
  }));

  const loadMw = express.Router({ mergeParams: true })
    .use(
      loadAgendaMw,
      loadEventMw,
      loadAgendaEventMw,
    );

  parentApp.get('/:agendaSlug/events/:eventSlug/state/:state', [
    requireLoggedMw,
    loadMw,
    members.mw.loadAndAuthorize('moderator'),
    changeStateMw,
  ]);

  parentApp.post('/:agendaSlug/events/:eventSlug/state', [
    requireLoggedMw,
    loadMw,
    members.mw.loadAndAuthorize('moderator'),
    changeStateMw,
  ]);

  parentApp.get('/:agendaSlug/events/:eventSlug/status', [
    requireLoggedMw,
    loadMw,
    members.mw.load,
    members.mw.authorizeAdminModOrEventOwner,
    updateStatusMw,
  ]);

  parentApp.delete('/:agendaSlug/events/:eventSlug', [
    requireLoggedMw,
    loadMw,
    members.mw.load,
    removeMw,
  ]);

  parentApp.get('/:agendaSlug/events/:eventSlug/remove', [
    requireLoggedMw,
    loadMw,
    members.mw.load,
    removeMw,
  ]);

  parentApp.get('/:agendaSlug/events/:eventSlug/featured/:type', [
    requireLoggedMw,
    loadMw,
    members.mw.loadAndAuthorize('moderator'),
    changeFeaturedMw,
  ]);

  parentApp.post('/:agendaSlug/admin/events/states', [
    sessions.mw.loadOrRedirect(),
    loadAgendaMw,
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('moderator'),
    changeStateMw.batched,
  ]);

  parentApp.all('/:agendaSlug/admin/events/batch', [
    sessions.mw.loadOrRedirect(),
    loadAgendaMw,
    agendas.mw.authorizeByIPAddress(),
    members.mw.loadAndAuthorize('moderator'),
    batchMw,
  ]);

  parentApp.get('/:agendaSlug/admin/events/navigate', [
    sessions.mw.loadOrRedirect(),
    loadAgendaMw,
    agendas.mw.authorizeByIPAddress(),
    navigateMw,
  ]);
};
