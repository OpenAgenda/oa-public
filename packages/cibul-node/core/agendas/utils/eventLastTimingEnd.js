// Compute an event's last-timing-end as a Date.
//
// Mirrors the precomputed `_search_last_timing` field that
// `packages/event-search/utils/formatEvent.js` writes onto every
// indexed event doc: `new Date(lastTiming.end)` where `lastTiming` is
// the timing with the largest `.end` value. Used by the agenda-search
// refresh marker to decide whether a mutation falls inside the
// current refresh window.
//
// Returns null when the event has no timings (no signal — the marker
// then defaults to "advance refresh", which is the safe choice).
export default (event) => {
  const timings = event?.timings;
  if (!timings || !timings.length) return null;

  let maxEnd = null;
  for (const t of timings) {
    if (t?.end == null) continue;
    if (maxEnd == null || t.end > maxEnd) maxEnd = t.end;
  }

  return maxEnd ? new Date(maxEnd) : null;
};
