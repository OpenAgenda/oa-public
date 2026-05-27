import { NotFound } from '@openagenda/verror';
import * as keysMw from '@openagenda/keys/middleware.js';
import { requireUser, requireUserJson } from '../../lib/authGuards.js';

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

  // D3b-agenda — agenda key management on the better-auth `apikey` store, via
  // the `@openagenda/auth` façade (referenceId `agenda:<uid>`). New paths,
  // parallel to the legacy `…/keys/*` above which stays live until the UI is
  // switched (D3c). Agenda keys are read-only (`agendaFullRead` semantics: v2
  // writes go through a `tk-` minted from a *user* secret, never an agenda
  // key), so a native agenda key already authenticates on v2 (GET, D3a′) and
  // v3 with no write-path change. No dual-write-back to the legacy `key` table:
  // these records live only in `apikey`. Same agenda-admin authorization as the
  // legacy routes, but gated with `requireUserJson` (401 JSON) rather than
  // `requireUser` (302 → signin): these are XHR/JSON endpoints, so a redirect
  // to an HTML page would be useless to the fetch client.
  app.get(
    '/:agendaSlug/admin/settings/api-keys',
    requireUserJson,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    async (req, res, next) => {
      try {
        const items = await req.app.services.auth.listAgendaKeys(
          req.agenda.uid,
        );
        res.json({ items, total: items.length });
      } catch (err) {
        next(err);
      }
    },
  );

  // Creates one key; the plaintext is returned ONCE under `key` (the stored
  // record never carries it). `record` is the persisted row sans key material.
  app.post(
    '/:agendaSlug/admin/settings/api-keys',
    requireUserJson,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    async (req, res, next) => {
      try {
        const { key, record } = await req.app.services.auth.createAgendaKey(
          req.agenda.uid,
          { name: req.body?.name ?? req.body?.label },
        );
        res.status(201).json({ key, record });
      } catch (err) {
        next(err);
      }
    },
  );

  // Owner-scoped revoke: the façade matches both id AND referenceId, so an
  // administrator of agenda A cannot delete a key of agenda B by id. A miss
  // (absent / not this agenda's) is a 404.
  app.delete(
    '/:agendaSlug/admin/settings/api-keys/:keyId',
    requireUserJson,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    async (req, res, next) => {
      try {
        const removed = await req.app.services.auth.revokeAgendaKey(
          req.agenda.uid,
          req.params.keyId,
        );
        if (!removed) {
          return next(new NotFound('api key not found'));
        }
        res.json({ removed: true });
      } catch (err) {
        next(err);
      }
    },
  );
}
