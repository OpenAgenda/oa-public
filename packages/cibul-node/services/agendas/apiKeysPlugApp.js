import { NotFound, BadRequest } from '@openagenda/verror';
import { requireUserJson } from '../../lib/authGuards.js';

// Agenda API key management on the better-auth `apikey` store, via the
// `@openagenda/auth` façade (referenceId `agenda:<uid>`). Agenda keys are
// read-only (`agendaFullRead` semantics: v2 writes go through a `tk-` minted
// from a *user* secret, never an agenda key). Same agenda-admin authorization
// as the rest of `/:agendaSlug/admin/*`, gated with `requireUserJson` (401
// JSON) rather than `requireUser` (302 → signin): XHR/JSON endpoints, so a
// redirect to an HTML page would be useless to the fetch client.
//
// Extracted from agendas/plugApp.js so 90_unit_agendaApiKeys.test.js can mount
// just these 4 routes with stubbed `agendas`/`members`/`auth` services without
// pulling in the rest of the agendas plugApp's surface.
export default function apiKeysPlugApp(app) {
  const { agendas, members } = app.services;

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

  // Rename one key (its `name` label), owner-scoped like revoke. 404 on a miss.
  app.patch(
    '/:agendaSlug/admin/settings/api-keys/:keyId',
    requireUserJson,
    agendas.mw.load,
    members.mw.loadAndAuthorize('administrator'),
    async (req, res, next) => {
      const { name } = req.body ?? {};
      if (typeof name !== 'string') {
        return next(new BadRequest('name is required and must be a string'));
      }
      try {
        const record = await req.app.services.auth.renameAgendaKey(
          req.agenda.uid,
          req.params.keyId,
          name,
        );
        if (!record) {
          return next(new NotFound('api key not found'));
        }
        res.json({ record });
      } catch (err) {
        next(err);
      }
    },
  );
}
