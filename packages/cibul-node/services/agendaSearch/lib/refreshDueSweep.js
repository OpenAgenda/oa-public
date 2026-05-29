import logs from '@openagenda/logs';

const log = logs('services/agendaSearch/refreshDueSweep');

const PAGE_SIZE = 50;
const CONCURRENCY = 4;

async function runWithConcurrency(items, limit, fn) {
  const queue = items.slice();
  const workers = [];
  const slotCount = Math.min(limit, queue.length);
  for (let i = 0; i < slotCount; i += 1) {
    workers.push(
      (async () => {
        while (queue.length) {
          const item = queue.shift();
          // eslint-disable-next-line no-await-in-loop
          await fn(item);
        }
      })(),
    );
  }
  await Promise.all(workers);
}

/**
 * Hourly refresh-due sweep (Layer 5).
 *
 * Single ES range query against the agenda-search alias for docs
 * whose `_nextRefreshAt` is in the past. For each hit, calls
 * `agendaSearch.set({ uid })` which goes through `getDetailedAgenda`
 * → `loadSummary` → `formatAgenda` and rewrites the doc with fresh
 * counts, fresh `eventsByEndDay`, and a new `_nextRefreshAt`.
 *
 * Concurrency capped at 4 — a small in-process pool replaces what the
 * Layer-1 BullMQ worker would have given us. Pagination via
 * `search_after` on `uid` walks the full result set without the
 * 10k `from`+`size` ceiling.
 *
 * Idempotent: a second tick running while a first is still in flight
 * sees the same docs in the range and may re-enqueue; the reindex
 * itself is the same `set` call ES treats as last-write-wins.
 *
 * Docs without `_nextRefreshAt` (pre-existing entries not yet
 * reindexed by Layer-5-aware code) are skipped naturally — the range
 * query doesn't match documents where the field is absent.
 */
export default (config, services) => async () => {
  const search = services.agendaSearch;
  const client = search.getElasticsearchClient();
  const alias = config.agendaSearchAlias;

  log('info', 'refresh-due sweep starting on alias %s', alias);

  let total = 0;
  let after = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const body = {
      size: PAGE_SIZE,
      _source: ['uid'],
      sort: [{ uid: 'asc' }],
      query: { range: { _nextRefreshAt: { lte: 'now' } } },
    };
    if (after) body.search_after = after;

    // eslint-disable-next-line no-await-in-loop
    const result = await client.search({ index: alias, body });
    const hits = result.body?.hits?.hits || [];
    if (!hits.length) break;

    const uids = hits
      .map((h) => h._source?.uid)
      .filter((u) => Number.isInteger(u));

    // eslint-disable-next-line no-await-in-loop
    await runWithConcurrency(uids, CONCURRENCY, async (uid) => {
      try {
        await search.set({ uid });
      } catch (e) {
        log(
          'error',
          'refresh failed for agenda %s: %j',
          uid,
          e?.meta?.body?.error ?? e?.message ?? e,
        );
      }
    });

    total += uids.length;
    after = hits[hits.length - 1].sort;
    if (hits.length < PAGE_SIZE) break;
  }

  log('info', 'refresh-due sweep finished, %s agendas refreshed', total);
  return { refreshed: total };
};
