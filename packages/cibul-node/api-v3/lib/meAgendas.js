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

import {
  mapAgendaSummary,
  mapAgendaDetailed,
  AGENDA_SELECT,
} from './mapAgenda.js';
import buildPagination from './pagination.js';
import {
  pickSelected,
  selectsTop,
  selectionToIncludes,
  fieldNamesOf,
} from './selectFields.js';

// The agenda field universe (drift-proof, from the mapper). A /me selection
// also carries `role`/`private` (grafted from the membership row, not the
// agenda index), so it is stripped to the agenda fields before being pushed
// down to the public-agenda search.
const AGENDA_UNIVERSE = new Set(fieldNamesOf(mapAgendaDetailed));
const agendaOnlySelection = (fields) =>
  new Set(
    [...fields].filter((path) => AGENDA_UNIVERSE.has(path.split('.')[0])),
  );

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

async function enrichAgendas(core, items, { detailed, fields = null }) {
  const { services } = core;
  const byUid = new Map();

  if (!items.length) {
    return byUid;
  }

  // The network/locationSet refs are detailed-only AND each costs a SQL get per
  // distinct uid in the fallback below. When `fields` is set and doesn't ask for
  // a ref, skip resolving it entirely — the real /me pushdown win (items are
  // tiny, so the `_source` saving is marginal by comparison).
  const wantNetwork = detailed && selectsTop(fields, 'network');
  const wantLocationSet = detailed && selectsTop(fields, 'locationSet');

  // Public agendas come from the index; push the selection down to the
  // `_source` (stripped to agenda fields — `uid` is always retained, so the
  // keyed merge below still works).
  const searchOptions = { detailed, indexed: null, private: null };
  if (fields) {
    searchOptions.onlyIncludeFields = selectionToIncludes(
      agendaOnlySelection(fields),
      AGENDA_SELECT,
    );
  }

  const { agendas = [] } = await core.agendas.search(
    { uid: items.map((i) => i.uid) },
    { size: items.length },
    searchOptions,
  );

  for (const agenda of agendas) {
    byUid.set(agenda.uid, { agenda, private: false });
  }

  const missingUids = items.map((i) => i.uid).filter((uid) => !byUid.has(uid));

  if (!missingUids.length) {
    return byUid;
  }

  // One SQL query for every index miss of the page. `networkUid` is excluded
  // from the service's default list projection (`list: false`); request it only
  // when the network ref will actually be resolved below.
  const { agendas: rows = [] } = await services.agendas.list(
    { uid: missingUids },
    0,
    missingUids.length,
    {
      private: null,
      includeImagePath: true,
      includeFields: wantNetwork ? ['networkUid'] : [],
    },
  );

  if (wantNetwork || wantLocationSet) {
    // Resolve the requested ref families the same way core's agenda get does
    // (the SQL record only carries the uids) — deduplicated and
    // concurrency-bounded. The two families are independent, so they resolve in
    // parallel (≤5 in flight each); an unselected one is skipped.
    const [networks, locationSets] = await Promise.all([
      wantNetwork
        ? resolveEach(
          rows.map((a) => a.networkUid),
          (uid) => services.networks.get(uid),
        )
        : Promise.resolve(new Map()),
      wantLocationSet
        ? resolveEach(
          rows.map((a) => a.locationSetUid),
          (uid) => services.agendaLocations.sets.get(uid),
        )
        : Promise.resolve(new Map()),
    ]);
    for (const agenda of rows) {
      if (wantNetwork) {
        agenda.network = networks.get(agenda.networkUid) ?? null;
      }
      if (wantLocationSet) {
        agenda.locationSet = locationSets.get(agenda.locationSetUid) ?? null;
      }
    }
  }

  for (const agenda of rows) {
    byUid.set(agenda.uid, { agenda, private: !!agenda.private });
  }

  return byUid;
}

// `item` is a membership row from core.users(uid).agendas.list:
// `{ uid, slug, title, member: { role, … } }`. An agenda that resolved at
// member-join time but misses both enrichment tiers (e.g. deleted between the
// two reads) degrades to that member-join base — uid/slug/title are known,
// the summary extras map to their empty values.
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
  { limit, detailed = false, fields = null },
) {
  const { items = [], total, after = null } = result ?? {};

  // A stale membership row — its agenda deleted while the member-row cleanup
  // task lags or fails — could not pick uid/slug/title from the member join.
  // It is unrepresentable (every contract field would be empty) and its
  // undefined uid would poison the search uid filter, so drop it from the
  // page. `total` may transiently overcount by those rows until the cleanup
  // catches up.
  const liveItems = items.filter((item) => item.uid != null);

  const enriched = await enrichAgendas(core, liveItems, { detailed, fields });

  return {
    // `fields` (when set) trims each item to the selected top-level subset.
    data: liveItems.map((item) =>
      pickSelected(mapItem(item, enriched.get(item.uid), { detailed }), fields)),
    // The members listing returns the last row's `order` (a scalar) even on
    // the last full page — short-page sentinel, gauged on the RAW page size:
    // stale rows were fetched, only their rendering is skipped.
    pagination: buildPagination({
      after,
      isLastPage: items.length < limit,
      limit,
      total,
    }),
  };
}
