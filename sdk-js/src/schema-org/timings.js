import { toInstant } from '@openagenda/utils/isoDatetime';

// The largest distance from the epoch a `Date` can hold, in milliseconds.
const MAX_DATE_MS = 8.64e15;

const isDateMs = (ms) => Number.isFinite(ms) && Math.abs(ms) <= MAX_DATE_MS;

// Epoch ms of a bound, or null when it is absent or cannot be read. Callers
// decide what an unreadable bound means; none of them throws on one. A bound
// may already be epoch milliseconds, within what a `Date` can hold: beyond
// it, formatting the date throws.
export const instantOf = (value) => {
  if (typeof value === 'number') {
    return isDateMs(value) ? value : null;
  }

  try {
    return toInstant(value);
  } catch {
    return null;
  }
};

// A date is past once its end is. The read always serves an end with its
// offset; an end that cannot be read leaves the date counted, as the server's
// own summary does: dropping a date silently is the harder failure to notice.
export const isPast = (timing, now) => {
  const end = instantOf(timing?.end);

  return end !== null && end < now;
};

// `now` is an instant: epoch milliseconds or a Date, the current time when
// absent. Anything else is a caller's mistake, and guessing would date every
// offer wrongly.
export function toNow(now) {
  if (now === undefined || now === null) {
    return Date.now();
  }

  const ms = now instanceof Date ? now.getTime() : now;

  // `Infinity` would judge every date past and withdraw every offer, silently.
  if (typeof ms !== 'number' || !isDateMs(ms)) {
    throw new TypeError(
      'schema-org: `now` must be epoch milliseconds or a Date',
    );
  }

  return ms;
}
