// v3 agenda param loader. Like the v2 `mw.loadAgenda` but THROWS a typed error
// (NotFound) so the v3 error handler renders the `{ error: { code, message } }`
// envelope — the v2 middleware writes a v2-shaped `{ error, agendaUid }` body
// itself, which would leak through on /v3. v3 exposes only the numeric
// :agendaUid (no slug route), so this handles uid lookup only.
//
// This is also the single visibility chokepoint for every `:agendaUid` route.
// A PRIVATE agenda is 404 across the board on v3 — not just the single get
// (which the service `get` already gates via its `private: false` default) but
// the events sub-routes too, which read `req.agenda` directly and would
// otherwise expose a private agenda's published events. We load with
// `private: null` (so we can see the flag) and gate AFTER resolving the agenda
// from cache OR db, so a cache entry populated elsewhere can't bypass the check.
// Returning 404 (not 403) deliberately doesn't confirm a private agenda exists.

import { NotFound } from '@openagenda/verror';

export default function createLoadAgenda(core) {
  const { simpleCache, agendas } = core.services;

  return async function loadAgenda(req, res, next) {
    try {
      const { agendaUid } = req.params;

      let agenda = await simpleCache
        .hash('agendas', agendaUid)
        .get('api', { json: true });

      if (!agenda) {
        agenda = await agendas.get(
          { uid: agendaUid },
          { private: null, internal: true },
        );
        if (agenda) {
          simpleCache.hash('agendas', agendaUid).set('api', agenda);
        }
      }

      // 404 for both "unknown" and "private": v3 reads expose only public
      // agendas, and we don't reveal the existence of a private one.
      if (!agenda || agenda.private) {
        throw new NotFound({ info: { uid: agendaUid } }, 'agenda not found');
      }

      req.agenda = agenda;
      next();
    } catch (err) {
      next(err);
    }
  };
}
