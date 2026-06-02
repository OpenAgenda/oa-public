import { produce } from 'immer';

// Threshold-driven refresh policy (Layer 5).
//
// At reindex time we walk the per-day distribution of events ending
// in the next HORIZON_DAYS days. Each day contributes its count to a
// cumulative tally. The first day where cumulative tally crosses `tau`
// (= max(MIN_ABSOLUTE, FRACTION * totalUpcoming)) is the moment the
// displayed count first becomes "meaningfully wrong" — that's
// `_nextRefreshAt`. If we never cross `tau` within the horizon, we
// force a refresh at horizon expiry so the next 30-day window gets
// populated.
const MIN_ABSOLUTE = 5;
const FRACTION = 0.05;
const HORIZON_DAYS = 30;

function _endOfDay(yyyyMmDd) {
  // Inputs are 'YYYY-MM-DD' from the lastTimings agg. End of that day
  // in UTC.
  return new Date(`${yyyyMmDd}T23:59:59.999Z`);
}

function _horizonExpiry() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + HORIZON_DAYS);
  return d;
}

function _computeNextRefreshAt({ eventsByEndDay, laterDays }) {
  const dayKeys = Object.keys(eventsByEndDay || {}).sort();
  const inHorizon = dayKeys.reduce((s, k) => s + eventsByEndDay[k], 0);
  const total = inHorizon + (laterDays || 0);
  if (total === 0) return null;

  const tau = Math.max(MIN_ABSOLUTE, FRACTION * total);

  let cum = 0;
  for (const day of dayKeys) {
    cum += eventsByEndDay[day];
    if (cum > tau) {
      return _endOfDay(day).toISOString();
    }
  }

  // Never tripped within the horizon: force refresh at horizon expiry
  // so the next 30-day window is populated.
  return _horizonExpiry().toISOString();
}

export default produce((agenda) => {
  agenda._hasUpcomingEvents = (agenda.summary?.publishedEvents?.current || 0)
      + (agenda.summary?.publishedEvents.upcoming || 0)
    > 0;
  agenda._recentlyAddedEvents = !!Object.keys(
    agenda.summary?.recentlyAddedEvents || {},
  ).filter((key) => !!agenda.summary?.recentlyAddedEvents[key]).length;
  agenda.official = !!agenda.official;
  agenda.indexed = !!agenda.indexed;
  agenda.slug = agenda.slug || null;

  // Compute when the displayed count first becomes meaningfully wrong.
  // Drives the hourly refreshDueSweep — only agendas whose threshold
  // has tripped get reindexed.
  agenda._nextRefreshAt = _computeNextRefreshAt({
    eventsByEndDay: agenda.summary?.publishedEvents?.eventsByEndDay,
    laterDays: agenda.summary?.publishedEvents?.laterDays,
  });
});
