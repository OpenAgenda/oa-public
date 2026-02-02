import * as keysMw from '@openagenda/keys/middleware.js';

export default function plugApp(app) {
  const { sessions, members, agendas } = app.services;

  app.post(
    '/:agendaSlug/admin/settings/keys/create',
    sessions.mw.loadOrRedirect(),
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
    sessions.mw.loadOrRedirect(),
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
    sessions.mw.loadOrRedirect(),
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
    sessions.mw.loadOrRedirect(),
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
    sessions.mw.loadOrRedirect(),
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
