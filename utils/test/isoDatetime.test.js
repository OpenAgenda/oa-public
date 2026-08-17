import { before, hasExplicitOffset, parseDuration, toInstant } from '../isoDatetime.js';

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

describe('before', () => {
  it('subtracts the duration from the occurrence start', () => {
    expect(before('2026-06-15T20:00:00+02:00', 'P30D')).toBe(
      Date.parse('2026-06-15T20:00:00+02:00') - 30 * 86400000,
    );
  });

  it('refuses to guess without a begin', () => {
    expect(() => before(undefined, 'P30D')).toThrow(/without a reference/);
  });
});
