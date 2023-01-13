'use strict';

const Flattener = require('../lib/transform/Flattener');
const accessibility = require('../lib/transform/accessibility');

const {
  flattenSourceValues,
} = Flattener;

describe('Flattener', () => {
  describe('standard operations', () => {
    it('takes a map and an object and flattens the object', () => {
      expect(
        Flattener.flatten([{
          source: 'custom.contactNumber',
          target: 'Phone number',
        }, {
          source: 'fullName',
          target: 'name',
        }], {
          fullName: 'Gaetan Latouche',
          custom: {
            contactNumber: 123,
          },
        }),
      ).toEqual({
        'Phone number': 123,
        name: 'Gaetan Latouche',
      });
    });

    it('preloads map in flatten function', () => {
      const flatten = Flattener([{
        source: 'yeepee',
        target: 'kay',
      }]);

      expect(
        flatten({ yeepee: 'yay' }),
      ).toEqual({
        kay: 'yay',
      });
    });

    it('if multiple targets are specified, result of transform function is spread over targets', () => {
      const flatten = Flattener([{
        source: 'col1',
        transform: col1val => [col1val.split('.')[0], col1val.split('.')[1]],
        target: ['spread1', 'spread2'],
      }]);

      expect(
        flatten({ col1: 'first.second' }),
      ).toEqual({
        spread1: 'first',
        spread2: 'second',
      });
    });

    it('if languages key is specified language variants from source are spread throughout multiple columns', () => {
      const flatten = Flattener([{
        source: 'description',
        target: ['Description courte - FR', 'Description courte - EN'],
        languages: ['fr', 'en'],
      }]);

      expect(
        flatten({
          description: {
            en: 'A desc',
            fr: 'Une desc',
          },
        }),
      ).toEqual({
        'Description courte - FR': 'Une desc',
        'Description courte - EN': 'A desc',
      });
    });
  });

  describe('transform', () => {
    it('if a function is specified in transform key it is used to transform data', () => {
      const flatten = Flattener([{
        source: ['col1', 'col2'],
        transform: (col1val, col2val) => col1val + col2val,
        target: 'merged',
      }]);

      expect(
        flatten({ col1: 'woo', col2: 'pidoo' }),
      ).toEqual({
        merged: 'woopidoo',
      });
    });

    it('if an object is specified in transform key, it is used to transform data', () => {
      const flatten = Flattener([{
        source: 'status',
        target: 'État',
        transform: {
          1: 'Programmé',
          4: 'Annulé',
        },
      }]);

      expect(
        flatten({ status: 4 }),
      ).toEqual({
        État: 'Annulé',
      });
    });
  });

  describe('unit - flattenSourceValues', () => {
    const options = {
      languages: ['fr', 'en', 'es', 'de'],
      includeLanguages: ['fr', 'en'],
    };

    it('if an includeLanguages option is specified, only the specified languages are returned', () => {
      const flattenedValue = flattenSourceValues(
        {
          source: 'title',
          target: ['Titre - FR'],
          languages: ['fr', 'en'],
        },
        { title: { fr: 'Un titre', en: 'A title', de: 'Ein Titel' } },
        options,
      );

      expect(flattenedValue).toEqual(['Un titre', 'A title']);
    });

    it('fix: accessibility map item does not break language selection', () => {
      const flattenedValueSet = flattenSourceValues(
        accessibility(options, { target: 'Accessibility' }),
        { accessibility: { hi: true, pi: true } },
        options,
      );

      expect(flattenedValueSet).toEqual([
        'Handicap auditif | Handicap psychique',
        'Hearing impairment | Psychic impairment',
      ]);
    });

    it('case: value at depth is read', () => {
      const mapItem = {
        source: 'location.types-de-lieu',
        target: 'Types de lieu',
        hasOptions: true,
        transform: {
          13: 'Lieu de pouvoir, édifice judiciaire',
          14: 'Lieu de spectacles, sports et loisirs',
          15: "Musée, salle d'exposition",
        },
      };

      const source = {
        location: {
          'types-de-lieu': 14,
        },
      };

      const opts = {
        languages: 'fr',
        lang: 'fr',
        labels: {
          'location.types-de-lieu': {
            fr: 'Types de lieux',
          },
        },
      };

      expect(
        flattenSourceValues(mapItem, source, opts),
      ).toBe('Lieu de spectacles, sports et loisirs');
    });
  });

  describe('other', () => {
    it('tranform also applies to deep paths', () => {
      const flatten = Flattener([{
        source: 'member.role',
        target: 'Role',
        transform: {
          1: 'Contributor',
        },
      }]);

      expect(
        flatten({ member: { role: 1 } }),
      ).toEqual({
        Role: 'Contributor',
      });
    });
  });

  describe('edge cases', () => {
    it('when deep key points to inexistant value, defaults at null', () => {
      const flatten = Flattener([{
        source: 'surface.shallow.deep',
        target: 'flat',
      }]);

      expect(flatten()).toEqual({ flat: null });
    });
  });
});
