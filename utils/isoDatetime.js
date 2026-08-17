// ISO-8601 datetimes that must carry an explicit offset, and the duration subset
// used to express "N before the start".
//
// Two rules, both learned the hard way:
//
//   1. A datetime without an offset cannot be placed on the timeline. Assuming
//      Europe/Paris is how a value silently becomes wrong for an event in La
//      Réunion. Callers localize naive source datetimes BEFORE handing them over.
//   2. A shape check is not enough. '2026-19-45T10:00:00+99:99' matches any
//      reasonable regex, and '2026-02-31T10:00:00Z' both matches AND parses,
//      rolling silently to March 3. So the value must also be a real instant
//      whose calendar day survives the round-trip.

// Requires a date, a time, and an offset (Z or ±HH[:]MM). Deliberately stricter
// than Date.parse, which happily accepts '2026-06-15T20:00:00'.
const OFFSET_ISO = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/;

// A Date is accepted directly: it IS an unambiguous instant, and a caller
// reading a timestamp column has one rather than a string.
const hasExplicitOffset = (value) => {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value !== 'string' || !OFFSET_ISO.test(value)) {
    return false;
  }

  const ms = Date.parse(value);

  if (Number.isNaN(ms)) {
    return false;
  }

  // Reject a rolled-over date (Feb 31 -> Mar 3) by comparing the calendar day
  // the string claims with the one the parsed instant lands on, read in the very
  // offset the string carries.
  const [, y, m, d] = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const offset = /(Z|[+-]\d{2}:?\d{2})$/.exec(value)[1];
  const shifted = offset === 'Z'
    ? ms
    : ms
      + (offset[0] === '-' ? -1 : 1)
        * (parseInt(offset.slice(1, 3), 10) * 3600000
          + parseInt(offset.slice(-2), 10) * 60000);
  const asUTC = new Date(shifted);

  return (
    asUTC.getUTCFullYear() === Number(y)
    && asUTC.getUTCMonth() + 1 === Number(m)
    && asUTC.getUTCDate() === Number(d)
  );
};

// Epoch ms, or null when the value is absent. Throws when it is present but
// unusable: an absent bound and an unreadable one are different situations and
// callers treat them differently.
const toInstant = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (!hasExplicitOffset(value)) {
    throw new Error(
      `isoDatetime: expected ISO-8601 with an explicit offset, got ${value}`,
    );
  }

  return value instanceof Date ? value.getTime() : Date.parse(value);
};

// Subset of ISO-8601 durations: weeks, days, hours, minutes, seconds.
//
// Years and months are REFUSED on purpose. Subtracting "one month" from an
// instant has no single answer (28-31 days, DST), so accepting them would mean
// inventing calendar semantics the caller never defined.
const DURATION = /^P(?!$)(\d+W)?(\d+D)?(T(?!$)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/;
const CALENDAR_UNITS = /^P(?!$)(\d+Y|\d+M(?![^T]*T)|\d+[YM])/;

const parseDuration = (value) => {
  if (typeof value !== 'string') {
    throw new Error(`isoDatetime: duration must be a string, got ${typeof value}`);
  }

  if (CALENDAR_UNITS.test(value)) {
    throw new Error(
      `isoDatetime: calendar durations (years, months) are not supported, got ${value} — use days`,
    );
  }

  const match = DURATION.exec(value);

  if (!match) {
    throw new Error(`isoDatetime: unsupported ISO-8601 duration ${value}`);
  }

  const w = match[1];
  const d = match[2];
  const h = match[4];
  const m = match[5];
  const s = match[6];
  const num = (part) => (part ? parseFloat(part) : 0);

  return (
    num(w) * 7 * 86400000
    + num(d) * 86400000
    + num(h) * 3600000
    + num(m) * 60000
    + num(s) * 1000
  );
};

// `reference − duration`, as an instant. TZ-immune by construction: it operates
// on instants, so it survives a recurrence or a reschedule that a stored
// absolute date would not.
const before = (reference, duration) => {
  const ms = toInstant(reference);

  if (ms === null) {
    throw new Error('isoDatetime: cannot apply a relative offset without a reference');
  }

  return ms - parseDuration(duration);
};

export {
  hasExplicitOffset, toInstant, parseDuration, before,
};
