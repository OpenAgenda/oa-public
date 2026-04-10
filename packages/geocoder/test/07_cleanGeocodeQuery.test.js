import { cleanGeocodeQuery } from '../Opencage/index.js';

describe('cleanGeocodeQuery', () => {
  describe('URL rejection', () => {
    it('throws on https URL', () => {
      let errors;

      try {
        cleanGeocodeQuery('https://google.com', 'FR');
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          origin: 'https://google.com',
          field: 'query',
          code: 'query.invalid',
          message: 'query should not be a URL',
        },
      ]);
    });

    it('throws on http URL', () => {
      expect(() => cleanGeocodeQuery('http://example.com', 'FR')).toThrow();
    });

    it('does not throw on normal address', () => {
      expect(() =>
        cleanGeocodeQuery('15 place André Maurois, Strasbourg', 'FR')).not.toThrow();
    });
  });

  describe('empty/null/undefined queries', () => {
    it('returns empty string for null', () => {
      const result = cleanGeocodeQuery(null, 'FR');
      expect(result.query).toBe('');
    });

    it('returns empty string for undefined', () => {
      const result = cleanGeocodeQuery(undefined, 'FR');
      expect(result.query).toBe('');
    });

    it('returns empty string for empty string', () => {
      const result = cleanGeocodeQuery('', 'FR');
      expect(result.query).toBe('');
    });

    it('returns empty string for whitespace only', () => {
      const result = cleanGeocodeQuery('   ', 'FR');
      expect(result.query).toBe('');
    });
  });

  describe('text cleaning', () => {
    it('trims whitespace', () => {
      const result = cleanGeocodeQuery('  Strasbourg  ', 'FR');
      expect(result.query).toBe('Strasbourg');
    });

    it('throws on query exceeding max length', () => {
      const longQuery = 'a'.repeat(250);
      let errors;

      try {
        cleanGeocodeQuery(longQuery, 'FR');
      } catch (e) {
        errors = e;
      }

      expect(Array.isArray(errors)).toBe(true);
      expect(errors[0].field).toBe('query');
      expect(errors[0].code).toBe('string.toolong');
    });
  });

  describe('country code transforms', () => {
    it.each([
      ['YT', 'FR'],
      ['PF', 'FR'],
      ['GF', 'FR'],
      ['PM', 'FR'],
      ['MQ', 'FR'],
      ['GP', 'FR'],
      ['RE', 'FR'],
      ['NC', 'FR'],
    ])('maps DOM-TOM %s to %s', (from, to) => {
      const result = cleanGeocodeQuery('test', from);
      expect(result.countryCode).toBe(to);
    });

    it('maps HK to CN', () => {
      const result = cleanGeocodeQuery('test', 'HK');
      expect(result.countryCode).toBe('CN');
    });

    it('maps AW to NL', () => {
      const result = cleanGeocodeQuery('test', 'AW');
      expect(result.countryCode).toBe('NL');
    });

    it('keeps other country codes unchanged', () => {
      const result = cleanGeocodeQuery('test', 'DE');
      expect(result.countryCode).toBe('DE');
    });
  });
});
