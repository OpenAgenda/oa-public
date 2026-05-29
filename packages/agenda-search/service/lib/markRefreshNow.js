import logs from '@openagenda/logs';

const log = logs('markRefreshNow');

// Conditionally advance `_nextRefreshAt` to `now` on the agenda-search
// doc — only when the mutation could affect a bucket inside the
// agenda's current refresh window. The check happens server-side in a
// Painless script, so the whole operation is a single ES round-trip.
//
// Why conditional: an event published months out has a
// `_search_last_timing` past the agenda's current `_nextRefreshAt`,
// which means cumulative-up-to-`_nextRefreshAt` doesn't change and the
// displayed count is off by ≤ tau (the threshold's tolerance budget).
// Skip the mark, defer to the scheduled refresh, save a reindex.
//
// Edge cases:
//   - `_nextRefreshAt` absent on the doc (first-time refresh after
//     deploy or freshly indexed agenda) → mark now.
//   - `eventLastTiming` absent (event has no timings, or unknown) →
//     mark now, the safe default.
//   - 404 (agenda not yet in the index, e.g. race with onCreate) →
//     silently no-op; the next resyncUpdated tick catches it via
//     updatedAt.
//
// See packages/event-search/utils/formatEvent.js for how
// `_search_last_timing` is derived (`new Date(lastTiming.end)`).
export default async ({ client, alias }, { uid, eventLastTiming }) => {
  const now = new Date().toISOString();
  const eventEndIso = eventLastTiming
    ? new Date(eventLastTiming).toISOString()
    : null;

  try {
    await client.update({
      index: alias,
      id: uid,
      body: {
        script: {
          source: `
            if (ctx._source._nextRefreshAt == null
                || params.eventEnd == null
                || params.eventEnd.compareTo(ctx._source._nextRefreshAt) <= 0) {
              ctx._source._nextRefreshAt = params.now;
            }
          `,
          params: { now, eventEnd: eventEndIso },
        },
      },
    });
  } catch (e) {
    if (e?.meta?.statusCode === 404) {
      // Agenda not yet in the index — the next resyncUpdated tick will
      // catch it via the existing updatedAt-driven path.
      return;
    }
    log(
      'warn',
      'failed to mark agenda %s for refresh: %j',
      uid,
      e?.meta?.body?.error ?? e?.message ?? e,
    );
  }
};
