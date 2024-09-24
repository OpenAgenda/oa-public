import express from 'express';
import loadAgendaMw from '../members/middleware/loadAgenda.js';
import loadEventMw from '../members/middleware/loadEvent.js';
import changeStateMw, {
  batched as batchedChangeStateMw,
} from './middleware/changeState.js';
import removeMw from './middleware/remove.js';
import changeFeaturedMw from './middleware/changeFeatured.js';
import updateStatusMw from './middleware/updateStatus.js';
import batchMw from './middleware/batch.js';
import navigateMw from './middleware/navigate.js';
import loadAgendaEventMw from './middleware/load.js';

// TODO supprimer les .get qui font des modifications ☠️

export default function plugApp(parentApp) {
  const { sessions, members, agendas } = parentApp.services;

  const requireLoggedMw = sessions.mw.ifUnlogged((req, res, next) =>
    next({
      code: 403,
      error: 'requiredLogged',
      message: 'You need to be logged',
    }));

  const loadMw = express
    .Router({ mergeParams: true })
    .use(loadAgendaMw, loadEventMw, loadAgendaEventMw);

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
    batchedChangeStateMw,
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
}
