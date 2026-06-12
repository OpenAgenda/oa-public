// The /me/agendas read: the caller's memberships, each enriched to the
// AgendaSummary base fields (or the AgendaDetailed projection when
// `detailed=true`) + the membership `role` + the agenda's `private` flag.
//
// Enrichment is two-tier because the agenda search index does NOT contain
// private agendas (the reindex source skips them) while /me must list them:
// one ES search covers the page's public agendas, and the misses (private —
// or unindexed edge cases) fall back to a SQL get. An agenda found in the
// index is public by construction (`private: false`); a SQL row carries its
// own flag.

import { mapAgendaSummary, mapAgendaDetailed } from './mapAgenda.js';
import { encodeCursor } from './cursor.js';

// Resolve `fn` over distinct values with bounded concurrency — the fallback
// fan-out must stay flat even for a worst-case page of 100 private agendas.
async function resolveEach(values, fn, { concurrency = 5 } = {}) {
  const distinct = [...new Set(values.filter((v) => v != null))];
  const resolved = new Map();
  for (let i = 0; i < distinct.length; i += concurrency) {
    await Promise.all(
      distinct.slice(i, i + concurrency).map(async (value) => {
        resolved.set(value, await fn(value));
      }),
    );
  }
  return resolved;
}

async function enrichAgendas(core, items, { detailed }) {
  const { services } = core;
  const byUid = new Map();

  if (!items.length) {
    return byUid;
  }

  const { agendas = [] } = await core.agendas.search(
    { uid: items.map((i) => i.uid) },
    { size: items.length },
    { detailed, indexed: null, private: null },
  );

  for (const agenda of agendas) {
    byUid.set(agenda.uid, { agenda, private: false });
  }

  const missingUids = items.map((i) => i.uid).filter((uid) => !byUid.has(uid));

  if (!missingUids.length) {
    return byUid;
  }

  // One SQL query for every index miss of the page.
  const { agendas: rows = [] } = await services.agendas.list(
    { uid: missingUids },
    0,
    missingUids.length,
    { private: null, includeImagePath: true },
  );

  if (detailed) {
    // The detailed tier resolves the network/locationSet refs the same way
    // core's agenda get does (the SQL record only carries the uids) —
    // deduplicated and concurrency-bounded.
    const networks = await resolveEach(
      rows.map((a) => a.networkUid),
      (uid) => services.networks.get(uid),
    );
    const locationSets = await resolveEach(
      rows.map((a) => a.locationSetUid),
      (uid) => services.agendaLocations.sets.get(uid),
    );
    for (const agenda of rows) {
      agenda.network = networks.get(agenda.networkUid) ?? null;
      agenda.locationSet = locationSets.get(agenda.locationSetUid) ?? null;
    }
  }

  for (const agenda of rows) {
    byUid.set(agenda.uid, { agenda, private: !!agenda.private });
  }

  return byUid;
}

// `item` is a membership row from core.users(uid).agendas.list:
// `{ uid, slug, title, member: { role, … } }`. An unresolvable agenda (e.g. a
// stale membership row) degrades to that member-join base — uid/slug/title
// are still known, the summary extras map to their empty values.
function mapItem(item, enriched, { detailed }) {
  const { agenda = item, private: isPrivate = false } = enriched ?? {};
  const mapAgendaItem = detailed ? mapAgendaDetailed : mapAgendaSummary;

  return {
    ...mapAgendaItem(agenda),
    private: isPrivate,
    role: item.member.role,
  };
}

export default async function buildMeAgendaList(
  core,
  result,
  { limit, detailed = false },
) {
  const { items = [], total, after = null } = result ?? {};

  const enriched = await enrichAgendas(core, items, { detailed });

  // The members listing returns the last row's `order` even on the last full
  // page — same short-page sentinel as the other SQL-backed lists.
  const isLastPage = items.length < limit;

  return {
    data: items.map((item) =>
      mapItem(item, enriched.get(item.uid), { detailed })),
    pagination: {
      after:
        isLastPage || after == null ? null : encodeCursor({ after: [after] }),
      limit,
      ...total === undefined ? {} : { total },
    },
  };
}
