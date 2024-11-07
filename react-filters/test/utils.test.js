import getAdditionalFilters from '../src/utils/getAdditionalFilters.js';
import minimizeAggregation from '../src/utils/minimizeAggregation.js';

import schemaFieldsFixtures from './fixtures/fields.json';

describe('utils', () => {
  describe('getAdditionalFilters', () => {
    let additionalFilters;

    beforeAll(() => {
      additionalFilters = getAdditionalFilters(schemaFieldsFixtures);
    });

    it('extracts additional filters names and fields from schema', () => {
      expect(additionalFilters.map((f) => f.name)).toEqual([
        'types-devenement',
        'location:specificite',
        'location:protections-appellation-et-labels',
      ]);
    });

    it('fields field key reference full paths', () => {
      expect(additionalFilters.map((f) => f.fieldSchema.field)).toEqual([
        'types-devenement',
        'location:specificite',
        'location:protections-appellation-et-labels',
      ]);
    });
  });

  describe('minimizeAggregation', () => {
    it('additionalFields becomes af and type becomes t', () => {
      expect(
        minimizeAggregation({
          type: 'additionalFields',
        }),
      ).toEqual({
        t: 'af',
      });
    });

    it('size becomes s', () => {
      expect(
        minimizeAggregation({
          size: 2000,
        }),
      ).toEqual({
        s: 2000,
      });
    });

    it('key becomes k, field becomes f, missing becomes m', () => {
      expect(
        minimizeAggregation({
          field: 'thing',
          key: 'thing',
          missing: 'N/A',
        }),
      ).toEqual({
        f: 'thing',
        k: 'thing',
        m: 'N/A',
      });
    });
  });
});
