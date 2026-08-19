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

// Errors carry `reason` — the message without the module prefix — beside the
// prefixed `message`. A caller re-emitting the explanation in its own error
// shape (the offers validator does) would otherwise strip the prefix with a
// regex, which couples it to a private message format across a package
// boundary: change the prefix and the string travels half-stripped, with no
// test failing.
const fault = (reason) =>
  Object.assign(new Error(`isoDatetime: ${reason}`), { reason });

// Requires a date, a time, and an offset (Z or ±HH[:]MM). Deliberately stricter
// than Date.parse, which happily accepts '2026-06-15T20:00:00'.
//
// Three conformant spellings are admitted that Date.parse does not read on every
// engine, and are normalised below before it sees them: the space separator, a
// lowercase `z`, and the decimal comma. This is a published package — a
// validator refusing a legal form freezes that refusal into the contract, and
// widening it afterwards is the change nobody gets to make cheaply.
const OFFSET_ISO = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}([.,]\d+)?)?(Z|z|[+-]\d{2}:?\d{2})$/;

// Date.parse is specified for the ISO subset only; the three forms above sit
// outside it and are engine-dependent — V8 reads the space separator, other
// engines need not. Normalising rather than trusting the engine is what keeps a
// value accepted here on the server from being refused by a browser once the
// form is wired up.
const normalize = (value) =>
  value.replace(' ', 'T').replace(',', '.').replace(/z$/, 'Z');

// Epoch ms, or NaN when the value cannot be placed on the timeline. The single
// parse both helpers below read: `hasExplicitOffset` used to parse a string and
// throw the result away, for `toInstant` to parse it again on the next line.
//
// A Date is accepted directly: it IS an unambiguous instant, and a caller
// reading a timestamp column has one rather than a string.
const instantOf = (value) => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value !== 'string' || !OFFSET_ISO.test(value)) {
    return NaN;
  }

  const normalized = normalize(value);
  const ms = Date.parse(normalized);

  if (Number.isNaN(ms)) {
    return NaN;
  }

  // Reject a rolled-over date (Feb 31 -> Mar 3) by comparing the calendar day
  // the string claims with the one the parsed instant lands on, read in the very
  // offset the string carries.
  const [, y, m, d] = /^(\d{4})-(\d{2})-(\d{2})/.exec(normalized);
  const offset = /(Z|[+-]\d{2}:?\d{2})$/.exec(normalized)[1];
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
  )
    ? ms
    : NaN;
};

const hasExplicitOffset = (value) => !Number.isNaN(instantOf(value));

// Epoch ms, or null when the value is absent. Throws when it is present but
// unusable: an absent bound and an unreadable one are different situations and
// callers treat them differently.
const toInstant = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const ms = instantOf(value);

  if (Number.isNaN(ms)) {
    throw fault(`expected ISO-8601 with an explicit offset, got ${value}`);
  }

  return ms;
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
    throw fault(`duration must be a string, got ${typeof value}`);
  }

  if (CALENDAR_UNITS.test(value)) {
    throw fault(
      `calendar durations (years, months) are not supported, got ${value} — use days`,
    );
  }

  const match = DURATION.exec(value);

  if (!match) {
    throw fault(`unsupported ISO-8601 duration ${value}`);
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

// `before(reference, duration)` — `reference − duration` as an instant — used to
// live here and has been withdrawn until it has a caller. Nothing resolves a
// relative window yet; that happens at read time, in the lot that derives a
// status. Every export of a published package is a compatibility commitment, so
// the cheap moment to not make one is before the release, not after.

export { hasExplicitOffset, toInstant, parseDuration };
