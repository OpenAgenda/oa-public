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
 *   4. Delete each orphan set with `delete_by_query` scoped by the `_set` term.
 *      NO `routing` is passed, on purpose: routing was only added to indexing
 *      in 2020 (event-search afeed7ae4b), so the oldest orphans — never
 *      reindexed, which is exactly this script's target — may sit on a
 *      default-routed shard; a routed delete would silently miss them. This
 *      mirrors the shared clear.js helper, which omits routing for the same
 *      reason. Deletes run asynchronously (wait_for_completion:false) and are
 *      polled, so the client request timeout (30s) is never hit on the large
 *      (~100k-doc) sets, and the deleted count stays accurate.
 *
 * Dry-run by default: it reports what it WOULD delete and deletes nothing.
 * Pass `--apply` to actually delete.
 *
 * Safety: refuses to run on an empty allowlist, and (in --apply) refuses when
 * an implausibly high share of agenda sets look orphan — a strong signal the
 * allowlist is incomplete (wrong/lagging DB, index shared across environments).
 * Override that ratio guard with `--force` once you've confirmed the DB.
 *
 * Usage:
 *   node scripts/cleanOrphanEvents.js                    # dry-run
 *   node scripts/cleanOrphanEvents.js --apply            # actually delete
 *   node scripts/cleanOrphanEvents.js --apply --force    # skip the ratio guard
 *   node scripts/cleanOrphanEvents.js --page-size 2000
 *   node scripts/cleanOrphanEvents.js --index events_live # explicit target
 *
 * Run it with the SAME environment as the app's `tasks` process (PM2): it needs
 * ES_HOST/ES_PORT/ES_AGENDA_EVENTS_INDEX and the DB credentials. The first log
 * line echoes the resolved target index — check it before using --apply.
 */

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const FORCE = args.includes('--force');
const PAGE_SIZE = (() => {
  const i = args.indexOf('--page-size');
  const n = i !== -1 ? parseInt(args[i + 1], 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 1000;
})();
// Explicit index override. When omitted the script targets
// config.es75.agendaEventsIndex (the `events_live` alias in prod). Pass
// `--index <name>` to be unambiguous — useful when launching outside the app's
// env, where the config could fall back to the wrong index.
const INDEX_OVERRIDE = (() => {
  const i = args.indexOf('--index');
  return i !== -1 ? args[i + 1] : undefined;
})();

const SET_PREFIX = 'agendas_';
// Above this share of orphan agenda sets, abort unless --force: such a ratio
// almost always means the live-agenda allowlist is incomplete, not that the
// index is genuinely that stale.
const MAX_ORPHAN_RATIO = 0.9;
const POLL_INTERVAL_MS = 2000;
// Per-set wall-clock ceiling: if a task never reports completed within this
// window, give up on the set (count it failed) rather than hang the whole run.
const DELETE_DEADLINE_MS = 60 * 60 * 1000;
// Tolerate a few transient tasks.get failures (429/503/404-while-finishing)
// before abandoning a delete that is very likely still running server-side.
const MAX_POLL_ERRORS = 5;

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function log(...a) {
  // eslint-disable-next-line no-console
  console.log(...a);
}

// Delete every document of a set, scoped by the `_set` term (no routing — see
// header). Runs the delete asynchronously and polls the task so a multi-minute
// delete over a large set never trips the client request timeout. Returns the
// number of documents actually deleted; THROWS on any outcome that leaves the
// set not fully cleaned (task error, partial failures, missing task id, poll
// deadline/errors) so the caller counts it as failed and the operator re-runs.
async function deleteSet(esClient, index, set) {
  const { body: started } = await esClient.deleteByQuery({
    index,
    conflicts: 'proceed',
    slices: 'auto',
    wait_for_completion: false,
    body: { query: { term: { _set: set } } },
  });

  const taskId = started.task;
  if (!taskId) {
    throw new Error(`delete_by_query returned no task id for set ${set}`);
  }

  const deadline = Date.now() + DELETE_DEADLINE_MS;
  let pollErrors = 0;
  for (;;) {
    if (Date.now() > deadline) {
      throw new Error(
        `timed out waiting for delete of set ${set} (task ${taskId})`,
      );
    }

    let task;
    try {
      // eslint-disable-next-line no-await-in-loop
      ({ body: task } = await esClient.tasks.get({ task_id: taskId }));
      pollErrors = 0;
    } catch (error) {
      pollErrors += 1;
      if (pollErrors >= MAX_POLL_ERRORS) {
        throw error;
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    if (task.completed) {
      if (task.error) {
        throw new Error(task.error.reason || 'delete_by_query failed');
      }
      const failures = task.response?.failures ?? [];
      if (failures.length) {
        // Partial failure: do NOT report the set as cleaned — surface it so the
        // set is counted failed and re-run, instead of leaving silent orphans.
        throw new Error(
          `${failures.length} delete failures`
            + ` (e.g. ${failures[0]?.cause?.reason ?? 'unknown'})`,
        );
      }
      return task.response?.deleted ?? 0;
    }

    const status = task.task?.status;
    if (status) {
      log(
        `[cleanOrphanEvents]   set ${set}: ${status.deleted ?? 0}/`
          + `${status.total ?? '?'} deleted…`,
      );
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(POLL_INTERVAL_MS);
  }
}

async function main() {
  log(
    `[cleanOrphanEvents] mode=${APPLY ? 'APPLY (will delete)' : 'DRY-RUN'} pageSize=${PAGE_SIZE}`,
  );

  const services = await initServices(config);
  const { knex } = config;
  const esConfig = services.eventSearch.getConfig();
  const esClient = esConfig.client;
  const index = INDEX_OVERRIDE ?? config.es75.agendaEventsIndex;
  const agendaTable = config.schemas?.agenda ?? 'agenda';

  // Surface the resolved target up front: if this prints `main`/`dev` instead of
  // `events_live` the env/config is wrong (e.g. run outside the app env) — abort
  // before touching anything rather than cleaning the wrong index.
  log(
    `[cleanOrphanEvents] targeting index "${index}"`
      + `${INDEX_OVERRIDE ? ' (--index override)' : ' (from config)'}`
      + ` on ${config.es75?.host ?? '?'}:${config.es75?.port ?? '?'}`,
  );

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
    let totalAgendaDocs = 0;
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

        totalAgendaDocs += bucket.doc_count;
        const uid = set.slice(SET_PREFIX.length);
        if (!liveUids.has(uid)) {
          orphanSets.push({ set, uid, docCount: bucket.doc_count });
        }
      }

      afterKey = agg.after_key;
    } while (afterKey);

    const agendaSets = scannedSets - skippedNonAgendaSets;
    const totalOrphanDocs = orphanSets.reduce((acc, o) => acc + o.docCount, 0);
    const orphanRatio = agendaSets > 0 ? orphanSets.length / agendaSets : 0;
    // Guard on the DOC share too, not just the set share: a few misclassified
    // but high-volume live agendas would keep the set ratio low while holding
    // the bulk of the documents.
    const orphanDocRatio = totalAgendaDocs > 0 ? totalOrphanDocs / totalAgendaDocs : 0;
    log(
      `[cleanOrphanEvents] scanned ${scannedSets} distinct sets`
        + ` (${skippedNonAgendaSets} non-"${SET_PREFIX}*" skipped)`,
    );
    log(
      `[cleanOrphanEvents] orphan sets: ${orphanSets.length}/${agendaSets}`
        + ` (${(orphanRatio * 100).toFixed(1)}%) totalling ${totalOrphanDocs}`
        + `/${totalAgendaDocs} documents (${(orphanDocRatio * 100).toFixed(1)}%)`,
    );

    if (orphanSets.length === 0) {
      log('[cleanOrphanEvents] nothing to clean.');
      return;
    }

    // Safety guard: an implausibly high orphan share — by set OR by document
    // count — almost always means the allowlist is incomplete (wrong/lagging
    // DB, shared index) rather than a genuinely stale index. Refuse to delete
    // live data unless --force.
    if (
      APPLY
      && (orphanRatio > MAX_ORPHAN_RATIO || orphanDocRatio > MAX_ORPHAN_RATIO)
      && !FORCE
    ) {
      throw new Error(
        `${(orphanRatio * 100).toFixed(1)}% of agenda sets / `
          + `${(orphanDocRatio * 100).toFixed(1)}% of documents look orphan`
          + ` (> ${(MAX_ORPHAN_RATIO * 100).toFixed(0)}% guard). This usually means`
          + ` the live-agenda allowlist (${liveUids.size} agendas) is incomplete.`
          + ' Verify the DB connection, then re-run with --force if intended.',
      );
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

    // 4. Delete each orphan set, scoped by the _set term (no routing — see header).
    let deletedDocs = 0;
    let failedSets = 0;
    for (let i = 0; i < orphanSets.length; i += 1) {
      const { set } = orphanSets[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        deletedDocs += await deleteSet(esClient, index, set);
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
