import '../lib/defineEnv.js';
import config from '../config/index.js';
import initServices from '../services/init.js';

/*
 * Cleanup of "ghost" events in the Elasticsearch index: documents that belong
 * to a set `agendas_<uid>` whose agenda has been (soft-)deleted but whose events
 * were never purged from the index — because the on-delete purge
 * (services/agendas/onRemove.js -> eventSearch.agendas(agenda).clear()) only
 * exists since 2024-05-06. Agendas deleted before that date left their event
 * documents behind, and a global reindex never touches them (it only walks
 * live agendas), so they linger forever.
 *
 * Strategy (set-based, allowlist):
 *   1. Build the allowlist of LIVE agenda uids (agenda.deleted_at IS NULL).
 *   2. Paginate every distinct `_set` value in the index via a composite
 *      aggregation (NOT a `terms` agg: there are tens of thousands of sets and
 *      `terms` would silently truncate).
 *   3. A set `agendas_<uid>` whose uid is not in the allowlist is an orphan
 *      (covers both soft-deleted agendas and rows that no longer exist).
 *   4. Delete each orphan set with `delete_by_query` scoped by `_set` term and
 *      `routing=<set>` so only the relevant shard is hit.
 *
 * Dry-run by default: it reports what it WOULD delete and deletes nothing.
 * Pass `--apply` to actually delete.
 *
 * Usage:
 *   node scripts/cleanOrphanEvents.js                 # dry-run
 *   node scripts/cleanOrphanEvents.js --apply         # actually delete
 *   node scripts/cleanOrphanEvents.js --page-size 2000
 */

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const PAGE_SIZE = (() => {
  const i = args.indexOf('--page-size');
  const n = i !== -1 ? parseInt(args[i + 1], 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 1000;
})();

const SET_PREFIX = 'agendas_';

function log(...a) {
  // eslint-disable-next-line no-console
  console.log(...a);
}

async function main() {
  log(
    `[cleanOrphanEvents] mode=${APPLY ? 'APPLY (will delete)' : 'DRY-RUN'} pageSize=${PAGE_SIZE}`,
  );

  const services = await initServices(config);
  const { knex } = config;
  const esConfig = services.eventSearch.getConfig();
  const esClient = esConfig.client;
  const index = config.es75.agendaEventsIndex;
  const agendaTable = config.schemas?.agenda ?? 'agenda';

  try {
    // 1. Allowlist of live agenda uids.
    const liveRows = await knex(agendaTable)
      .whereNull('deleted_at')
      .select('uid');
    const liveUids = new Set(liveRows.map((r) => String(r.uid)));
    log(
      `[cleanOrphanEvents] live agendas (deleted_at IS NULL): ${liveUids.size}`,
    );

    // Safety guard: an empty allowlist almost certainly means the DB query
    // failed or hit the wrong table — never proceed to delete everything.
    if (liveUids.size === 0) {
      throw new Error(
        'live agenda allowlist is empty — refusing to run (would mark every set orphan)',
      );
    }

    // 2. Paginate every distinct _set via a composite aggregation.
    const orphanSets = []; // { set, uid, docCount }
    let scannedSets = 0;
    let skippedNonAgendaSets = 0;
    let afterKey;

    do {
      // eslint-disable-next-line no-await-in-loop
      const { body } = await esClient.search({
        index,
        body: {
          size: 0,
          aggs: {
            sets: {
              composite: {
                size: PAGE_SIZE,
                sources: [{ set: { terms: { field: '_set' } } }],
                ...afterKey ? { after: afterKey } : {},
              },
            },
          },
        },
      });

      const agg = body.aggregations.sets;
      for (const bucket of agg.buckets) {
        const { set } = bucket.key;
        scannedSets += 1;

        // Only touch sets that associate documents to an agenda. Leave the
        // transverse index and any other set untouched (per ticket).
        if (!set.startsWith(SET_PREFIX)) {
          skippedNonAgendaSets += 1;
          continue;
        }

        const uid = set.slice(SET_PREFIX.length);
        if (!liveUids.has(uid)) {
          orphanSets.push({ set, uid, docCount: bucket.doc_count });
        }
      }

      afterKey = agg.after_key;
    } while (afterKey);

    const totalOrphanDocs = orphanSets.reduce((acc, o) => acc + o.docCount, 0);
    log(
      `[cleanOrphanEvents] scanned ${scannedSets} distinct sets`
        + ` (${skippedNonAgendaSets} non-"${SET_PREFIX}*" skipped)`,
    );
    log(
      `[cleanOrphanEvents] orphan sets: ${orphanSets.length}`
        + ` totalling ${totalOrphanDocs} documents`,
    );

    if (orphanSets.length === 0) {
      log('[cleanOrphanEvents] nothing to clean.');
      return;
    }

    if (!APPLY) {
      const preview = orphanSets.slice(0, 20);
      log('[cleanOrphanEvents] DRY-RUN — sample of orphan sets (max 20):');
      for (const o of preview) {
        log(`  - ${o.set} (uid=${o.uid}, ${o.docCount} docs)`);
      }
      if (orphanSets.length > preview.length) {
        log(`  … and ${orphanSets.length - preview.length} more`);
      }
      log('[cleanOrphanEvents] re-run with --apply to delete.');
      return;
    }

    // 4. Delete each orphan set, scoped by _set + routing.
    let deletedDocs = 0;
    let failedSets = 0;
    for (let i = 0; i < orphanSets.length; i += 1) {
      const { set } = orphanSets[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        const { body } = await esClient.deleteByQuery({
          index,
          routing: set,
          conflicts: 'proceed',
          body: { query: { term: { _set: set } } },
        });
        deletedDocs += body.deleted ?? 0;
      } catch (error) {
        failedSets += 1;
        log(`[cleanOrphanEvents] FAILED to clear set ${set}:`, error.message);
      }

      if ((i + 1) % 100 === 0 || i + 1 === orphanSets.length) {
        log(
          `[cleanOrphanEvents] progress ${i + 1}/${orphanSets.length} sets,`
            + ` ${deletedDocs} docs deleted, ${failedSets} failed`,
        );
      }
    }

    log(
      `[cleanOrphanEvents] done. deleted ${deletedDocs} documents`
        + ` across ${orphanSets.length - failedSets} sets (${failedSets} failed).`,
    );
  } finally {
    if (services.shutdown) {
      await services.shutdown().catch(() => {});
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[cleanOrphanEvents] error:', err);
    process.exit(1);
  });
