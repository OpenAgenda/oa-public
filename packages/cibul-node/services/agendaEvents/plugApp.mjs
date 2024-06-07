import express from 'express';
import loadAgendaMw from '../members/middleware/loadAgenda.js';
import loadEventMw from '../members/middleware/loadEvent.js';
import changeStateMw from './middleware/changeState.mjs';
import removeMw from './middleware/remove.mjs';
import changeFeaturedMw from './middleware/changeFeatured.mjs';
import updateStatusMw from './middleware/updateStatus.mjs';
import batchMw from './middleware/batch.mjs';
import navigateMw from './middleware/navigate.mjs';
import loadAgendaEventMw from './middleware/load.mjs';

// TODO supprimer les .get qui font des modifications ☠️

export default function plugApp(parentApp) {
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

  parentApp.get('/:agendaSlug/navigate', [
    sessions.mw.load(),
    loadAgendaMw,
    agendas.mw.authorizeByIPAddress(),
    navigateMw,
  ]);
};
