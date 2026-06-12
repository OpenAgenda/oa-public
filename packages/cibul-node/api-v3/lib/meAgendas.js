// The /me/agendas read: the caller's memberships, each enriched to the
// AgendaSummary base fields + the membership `role` + the agenda's `private`
// flag.
//
// Enrichment is two-tier because the agenda search index does NOT contain
// private agendas (the reindex source skips them) while /me must list them:
// one ES search covers the page's public agendas, and the misses (private —
// or unindexed edge cases) fall back to a SQL get. An agenda found in the
// index is public by construction (`private: false`); a SQL row carries its
// own flag.

import { mapAgendaSummary } from './mapAgenda.js';
import { encodeCursor } from './cursor.js';

async function enrichAgendas(core, items) {
  const byUid = new Map();

  if (!items.length) {
    return byUid;
  }

  const { agendas = [] } = await core.agendas.search(
    { uid: items.map((i) => i.uid) },
    { size: items.length },
    { detailed: false, indexed: null, private: null },
  );

  for (const agenda of agendas) {
    byUid.set(agenda.uid, { agenda, private: false });
  }

  await Promise.all(
    items
      .filter((i) => !byUid.has(i.uid))
      .map(async (item) => {
        const agenda = await core.services.agendas.get(
          { uid: item.uid },
          { private: null, internal: true, includeImagePath: true },
        );
        if (agenda) {
          byUid.set(item.uid, { agenda, private: !!agenda.private });
        }
      }),
  );

  return byUid;
}

// `item` is a membership row from core.users(uid).agendas.list:
// `{ uid, slug, title, member: { role, … } }`. An unresolvable agenda (e.g. a
// stale membership row) degrades to that member-join base — uid/slug/title
// are still known, the summary extras map to their empty values.
function mapItem(item, enriched) {
  const { agenda = item, private: isPrivate = false } = enriched ?? {};

  return {
    ...mapAgendaSummary(agenda),
    private: isPrivate,
    role: item.member.role,
  };
}

export default async function buildMeAgendaList(core, result, { limit }) {
  const { items = [], total, after = null } = result ?? {};

  const enriched = await enrichAgendas(core, items);

  // The members listing returns the last row's `order` even on the last full
  // page — same short-page sentinel as the other SQL-backed lists.
  const isLastPage = items.length < limit;

  return {
    data: items.map((item) => mapItem(item, enriched.get(item.uid))),
    pagination: {
      after:
        isLastPage || after == null ? null : encodeCursor({ after: [after] }),
      limit,
      ...total === undefined ? {} : { total },
    },
  };
}
