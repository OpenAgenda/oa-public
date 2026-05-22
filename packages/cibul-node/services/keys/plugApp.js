import * as keysMw from '@openagenda/keys/middleware.js';
import { requireUser } from '../../lib/authGuards.js';

export default function plugApp(app) {
  const { members, agendas } = app.services;

  app.post(
    '/:agendaSlug/admin/settings/keys/create',
    requireUser,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    (req, res, next) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid,
      };
      next();
    },
    keysMw.create(),
    (req, res) => res.send(req.result),
  );

  app.get(
    '/:agendaSlug/admin/settings/keys/get',
    requireUser,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    (req, res, next) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid,
        key: req.query.key,
      };
      next();
    },
    keysMw.get(),
    (req, res) => res.send(req.result),
  );

  app.get(
    '/:agendaSlug/admin/settings/keys/list',
    requireUser,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    (req, res, next) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid,
      };
      req.options = { total: true };
      next();
    },
    keysMw.list(),
    (req, res) => res.send(req.result),
  );

  app.patch(
    '/:agendaSlug/admin/settings/keys/update',
    requireUser,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    (req, res, next) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid,
        key: req.query.key,
      };
      next();
    },
    keysMw.update(),
    (req, res) => res.send(req.result),
  );

  app.delete(
    '/:agendaSlug/admin/settings/keys/remove',
    requireUser,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    (req, res, next) => {
      req.identifiers = {
        type: 'agendaFullRead',
        identifier: req.agenda.uid,
        key: req.query.key,
      };
      next();
    },
    keysMw.remove(),
    (req, res) => res.send({ rowAffected: req.result }),
  );
}
