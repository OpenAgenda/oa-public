import { exponentOf, isCurrencyCode, toMajor, toMinor } from '../iso4217.js';

// The whole point of this module is that dividing by 100 is wrong for a real
// share of currencies, so the exponent cases are tested explicitly rather than
// through EUR alone.
describe('iso4217', () => {
  describe('exponentOf', () => {
    it('defaults to 2', () => {
      expect(exponentOf('EUR')).toBe(2);
      expect(exponentOf('USD')).toBe(2);
      expect(exponentOf('MGA')).toBe(2);
    });

    it('knows the zero-decimal currencies', () => {
      expect(exponentOf('JPY')).toBe(0);
      expect(exponentOf('KRW')).toBe(0);
      expect(exponentOf('XOF')).toBe(0);
    });

    it('knows the three- and four-decimal currencies', () => {
      expect(exponentOf('KWD')).toBe(3);
      expect(exponentOf('TND')).toBe(3);
      expect(exponentOf('CLF')).toBe(4);
    });

    it('throws on an unknown code rather than assuming 2', () => {
      expect(() => exponentOf('XXX')).toThrow(/unknown currency/);
      expect(() => exponentOf('eur')).toThrow(/unknown currency/);
    });
  });

  describe('isCurrencyCode', () => {
    it('accepts real codes and refuses look-alikes', () => {
      expect(isCurrencyCode('EUR')).toBe(true);
      expect(isCurrencyCode('CHF')).toBe(true);
      expect(isCurrencyCode('EURO')).toBe(false);
      expect(isCurrencyCode('€')).toBe(false);
      expect(isCurrencyCode(undefined)).toBe(false);
    });
  });

  describe('toMajor', () => {
    it('formats minor units with the currency scale', () => {
      expect(toMajor(1800, 'EUR')).toBe('18.00');
      expect(toMajor(2550, 'EUR')).toBe('25.50');
      expect(toMajor(5, 'EUR')).toBe('0.05');
      expect(toMajor(0, 'EUR')).toBe('0.00');
    });

    it('does not insert a separator for zero-decimal currencies', () => {
      expect(toMajor(1800, 'JPY')).toBe('1800');
      expect(toMajor(0, 'XOF')).toBe('0');
    });

    it('uses three digits for KWD', () => {
      expect(toMajor(1800, 'KWD')).toBe('1.800');
      expect(toMajor(12, 'KWD')).toBe('0.012');
    });

    it('returns a string so the scale survives', () => {
      expect(typeof toMajor(2500, 'EUR')).toBe('string');
      expect(toMajor(2500, 'EUR')).toBe('25.00'); // not 25
    });

    it('refuses a non-integer amount — minor units are integers', () => {
      expect(() => toMajor(18.5, 'EUR')).toThrow(/integer in minor units/);
    });

    // Review finding 11: 1e21 is an "integer" whose String() is '1e+21', which the
    // digit arithmetic turned into '1e+.21'.
    it('refuses an amount past the safe-integer range instead of emitting garbage', () => {
      expect(() => toMajor(1e21, 'EUR')).toThrow(/safe integer/);
      expect(() => toMajor(Number.MAX_SAFE_INTEGER + 2, 'EUR')).toThrow(
        /safe integer/,
      );
    });
  });

  describe('toMinor', () => {
    it('converts provider major units', () => {
      expect(toMinor(18, 'EUR')).toBe(1800);
      expect(toMinor(25.5, 'EUR')).toBe(2550);
      expect(toMinor('18.90', 'EUR')).toBe(1890);
      expect(toMinor(1800, 'JPY')).toBe(1800);
    });

    it('survives float noise', () => {
      // 0.29 * 100 is 28.999999999999996 in IEEE 754
      expect(toMinor(0.29, 'EUR')).toBe(29);
      expect(toMinor(1.005, 'KWD')).toBe(1005);
    });

    it('refuses an amount finer than the currency allows', () => {
      expect(() => toMinor(0.005, 'EUR')).toThrow(/more precision/);
    });

    // Review finding 3: Number(null) is 0, so an absent-as-null provider price
    // used to become a FREE ticket; and NaN defeated the precision guard, so
    // garbage returned NaN and only failed much later inside priceCents.
    it('refuses null rather than turning an unknown price into a free one', () => {
      expect(() => toMinor(null, 'EUR')).toThrow(/not a usable amount/);
      expect(() => toMinor('', 'EUR')).toThrow(/not a usable amount/);
    });

    it('refuses garbage instead of returning NaN', () => {
      expect(() => toMinor(undefined, 'EUR')).toThrow(/not a usable amount/);
      expect(() => toMinor('abc', 'EUR')).toThrow(/not a usable amount/);
      expect(() => toMinor('12,50', 'EUR')).toThrow(/not a usable amount/);
      expect(() => toMinor(Infinity, 'EUR')).toThrow(/not a usable amount/);
    });
  });
});
