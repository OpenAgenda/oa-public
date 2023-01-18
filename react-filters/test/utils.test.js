import getAdditionalFilters from '../src/utils/getAdditionalFilters';

import schemaFieldsFixtures from './fixtures/fields.json';

describe('utils', () => {
  describe('getAdditionalFilters', () => {
    let additionalFilters;

    beforeAll(() => {
      additionalFilters = getAdditionalFilters(schemaFieldsFixtures);
    });

    it('extracts additional filters names and fields from schema', () => {
      expect(
        additionalFilters.map(f => f.name),
      ).toEqual(
        ['types-devenement', 'location:specificite', 'location:protections-appellation-et-labels'],
      );
    });

    it('fields field key reference full paths', () => {
      expect(
        additionalFilters.map(f => f.fieldSchema.field),
      ).toEqual([
        'types-devenement',
        'location:specificite',
        'location:protections-appellation-et-labels',
      ]);
    });
  });
});
