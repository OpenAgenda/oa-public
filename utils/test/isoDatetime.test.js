import { hasExplicitOffset, parseDuration, toInstant } from '../isoDatetime.js';

describe('hasExplicitOffset', () => {
  it('accepts an ISO datetime carrying an offset', () => {
    expect(hasExplicitOffset('2026-06-15T20:00:00+02:00')).toBe(true);
    expect(hasExplicitOffset('2026-06-15T20:00:00Z')).toBe(true);
    expect(hasExplicitOffset('2026-06-15T20:00:00.500Z')).toBe(true);
    expect(hasExplicitOffset('2026-06-15T20:00+0200')).toBe(true);
  });

  it('refuses an offset-less value — no silent Europe/Paris', () => {
    expect(hasExplicitOffset('2026-06-15T20:00:00')).toBe(false);
    expect(hasExplicitOffset('2026-06-15')).toBe(false);
    expect(hasExplicitOffset(undefined)).toBe(false);
    expect(hasExplicitOffset(1781000000000)).toBe(false);
  });

  // Review finding 4: the regex alone let impossible dates through write
  // validation, and the read path then threw on them (or misread them).
  it('refuses a shape-valid but impossible instant', () => {
    expect(hasExplicitOffset('2026-19-45T10:00:00+99:99')).toBe(false);
  });

  it('refuses a date that would silently roll over', () => {
    // Feb 31 parses, landing on March 3 — a sale window three days off.
    expect(hasExplicitOffset('2026-02-31T10:00:00Z')).toBe(false);
    expect(hasExplicitOffset('2026-04-31T10:00:00Z')).toBe(false);
  });

  it('keeps the real leap day', () => {
    expect(hasExplicitOffset('2024-02-29T10:00:00Z')).toBe(true);
  });

  it('accepts a Date instance — an unambiguous instant', () => {
    expect(hasExplicitOffset(new Date('2026-06-15T20:00:00Z'))).toBe(true);
    expect(hasExplicitOffset(new Date('nope'))).toBe(false);
  });

  // Conformant ISO-8601 spellings Date.parse does not read on every engine, so
  // they are normalised before it sees them. A published validator that refused
  // a legal form would freeze the refusal into the contract.
  it('accepts the lowercase z, the decimal comma and the space separator', () => {
    expect(hasExplicitOffset('2026-06-15T20:00:00z')).toBe(true);
    expect(hasExplicitOffset('2026-06-15T20:00:00,500Z')).toBe(true);
    expect(hasExplicitOffset('2026-06-15 20:00:00Z')).toBe(true);
    expect(hasExplicitOffset('2026-06-15 20:00:00,500+02:00')).toBe(true);
  });

  it('still applies the calendar check to the forms it normalises', () => {
    expect(hasExplicitOffset('2026-02-31T10:00:00z')).toBe(false);
    expect(hasExplicitOffset('2026-02-31 10:00:00Z')).toBe(false);
  });

  it('reads a normalised form as the very same instant', () => {
    expect(toInstant('2026-06-15 20:00:00,500z')).toBe(
      toInstant('2026-06-15T20:00:00.500Z'),
    );
  });

  it('checks the calendar day in the offset the value carries, not in UTC', () => {
    // 2026-06-15T00:30+02:00 is still 14 June in UTC; the claim is about the 15th.
    expect(hasExplicitOffset('2026-06-15T00:30:00+02:00')).toBe(true);
    expect(hasExplicitOffset('2026-06-15T23:30:00-05:00')).toBe(true);
  });
});

describe('toInstant', () => {
  it('returns null for an absent value — a missing bound means always-open', () => {
    expect(toInstant(undefined)).toBeNull();
    expect(toInstant(null)).toBeNull();
    expect(toInstant('')).toBeNull();
  });

  it('converts an offset-bearing string and a Date', () => {
    expect(toInstant('2026-06-15T20:00:00Z')).toBe(
      Date.parse('2026-06-15T20:00:00Z'),
    );
    expect(toInstant(new Date('2026-06-15T20:00:00Z'))).toBe(
      Date.parse('2026-06-15T20:00:00Z'),
    );
  });

  it('throws on an offset-less or impossible value', () => {
    expect(() => toInstant('2026-06-15T20:00:00')).toThrow(/explicit offset/);
    expect(() => toInstant('2026-02-31T10:00:00Z')).toThrow(/explicit offset/);
  });
});

describe('parseDuration', () => {
  it('parses the units the contract uses', () => {
    expect(parseDuration('P30D')).toBe(30 * 86400000);
    expect(parseDuration('PT0S')).toBe(0);
    expect(parseDuration('PT1H')).toBe(3600000);
    expect(parseDuration('P1W')).toBe(7 * 86400000);
    expect(parseDuration('P1DT2H30M')).toBe(
      86400000 + 2 * 3600000 + 30 * 60000,
    );
  });

  it('refuses calendar units — subtracting a month from an instant is ambiguous', () => {
    expect(() => parseDuration('P1M')).toThrow(/calendar durations/);
    expect(() => parseDuration('P1Y')).toThrow(/calendar durations/);
  });

  it('keeps minutes inside a time part', () => {
    expect(parseDuration('PT30M')).toBe(30 * 60000);
  });

  it('refuses nonsense', () => {
    expect(() => parseDuration('P')).toThrow(/unsupported/);
    expect(() => parseDuration('30D')).toThrow(/unsupported/);
    expect(() => parseDuration(30)).toThrow(/must be a string/);
  });
});

// The message prefix is this module's private business; `reason` is the part a
// caller may re-emit in its own error shape. Asserted so the offers validator's
// use of it cannot rot silently.
describe('error shape', () => {
  const thrownBy = (fn) => {
    try {
      fn();
    } catch (error) {
      return error;
    }

    return null;
  };

  it('carries the bare reason beside the prefixed message', () => {
    const error = thrownBy(() => parseDuration('P1M'));

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toMatch(/^isoDatetime: /);
    expect(error.reason).toBe(
      'calendar durations (years, months) are not supported, got P1M — use days',
    );
  });

  it('carries it on the datetime side too', () => {
    const error = thrownBy(() => toInstant('2026-06-15T20:00:00'));

    expect(error.reason).toBe(
      'expected ISO-8601 with an explicit offset, got 2026-06-15T20:00:00',
    );
  });
});
