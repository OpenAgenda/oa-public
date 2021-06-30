'use strict';

const flattener = require('@openagenda/flattener');
const timings = require('../lib/transform/timings');
const multilingual = require('../lib/transform/multilingual');
const accessibility = require('../lib/transform/accessibility');

describe('flat-exports - unit - transforms', () => {
  describe('timings', () => {
    test('transformer spreads detailed timings over one ISO column and multiple language-specific columns', () => {
      const map = [timings({
        languages: ['fr', 'en']
      }, {})];

      const flatten = flattener(map);

      const flat = flatten({
        timings: [{
          begin: '2017-03-16T09:30:00+01:00',
          end: '2017-03-16T12:00:00+01:00'
        }]
      });

      expect(flat).toEqual({
        ISO: '2017-03-16T09:30:00+01:00 -> 2017-03-16T12:00:00+01:00',
        'timings - FR': 'jeudi 16 mars 2017 - 09:30',
        'timings - EN': 'Thursday 16 March 2017 - 09:30'
      });
    });

    test('transformer displays times in timezone explicited in source data', () => {
      const map = [timings({
        languages: ['fr', 'en']
      }, {})];

      const flatten = flattener(map);

      const flat = flatten({
        timings: [{
          begin: '2017-03-16T09:30:00-01:00',
          end: '2017-03-16T12:00:00-01:00'
        }]
      });

      expect(flat).toEqual({
        ISO: '2017-03-16T09:30:00-01:00 -> 2017-03-16T12:00:00-01:00',
        'timings - FR': 'jeudi 16 mars 2017 - 09:30',
        'timings - EN': 'Thursday 16 March 2017 - 09:30'
      });
    });

    test('transformer concatenates timings which occur in the same day', () => {
      const map = [timings({
        languages: ['fr']
      }, {})];

      const flatten = flattener(map);

      const flat = flatten({
        timings: [{
          begin: '2017-03-16T09:30:00+06:00',
          end: '2017-03-16T12:00:00+06:00'
        }, {
          begin: '2017-03-16T14:30:00+06:00',
          end: '2017-03-16T22:00:00+06:00'
        }, {
          begin: '2017-03-17T09:30:00+06:00',
          end: '2017-03-17T12:00:00+06:00'
        }]
      });

      expect(flat).toEqual({
        ISO: '2017-03-16T09:30:00+06:00 -> 2017-03-16T12:00:00+06:00 | 2017-03-16T14:30:00+06:00 -> 2017-03-16T22:00:00+06:00 | 2017-03-17T09:30:00+06:00 -> 2017-03-17T12:00:00+06:00',
        timings: 'jeudi 16 mars 2017 - 09:30, 14:30 | vendredi 17 mars 2017 - 09:30'
      });
    });
  });

  describe('accessibility', () => {
    test('transformer returns single language when language is specified and available in labels', () => {
      const map = [accessibility({
        languages: ['fr']
      }, {})];

      const flatten = flattener(map);

      const flat = flatten({
        accessibility: { hi: true, vi: true, pi: false }
      });

      expect(flat).toEqual({
        accessibility: 'Handicap auditif | Handicap visuel'
      });
    });

    test('transformer returns language columns when a corresponding label is available', () => {
      const map = [accessibility({
        languages: ['fr', 'en', 'de']
      }, {})];

      const flatten = flattener(map);

      const flat = flatten({
        accessibility: { vi: true, pi: false }
      });

      expect(flat).toEqual({
        'accessibility - DE': 'Sehbehinderung',
        'accessibility - EN': 'Visual impairment',
        'accessibility - FR': 'Handicap visuel'
      });
    });

    test('transformer puts result in specified target', () => {
      const map = [accessibility({
        languages: ['fr']
      }, {
        target: 'Accessibilité'
      })];

      const flatten = flattener(map);

      const flat = flatten({
        accessibility: { vi: true, pi: false, hi: false }
      });

      expect(flat).toEqual({
        Accessibilité: 'Handicap visuel'
      });
    });
  });

  /**
   * these helpers build mapping for flattener
   */

  describe('multilingual', () => {
    test('multilingual field returns single value configuration when one language is specified', () => {
      const map = [multilingual({
        languages: ['fr']
      }, {
        source: 'title'
      })];

      const flatten = flattener(map);

      const flat = flatten({
        title: {
          fr: 'Un titre',
          en: 'A title'
        }
      });

      expect(flat).toEqual({
        title: 'Un titre'
      });
    });

    test('multilingual field puts value in target field when set', () => {
      const map = [multilingual({
        languages: ['en']
      }, {
        source: 'title',
        target: 'Titre'
      })];

      const flatten = flattener(map);

      const flat = flatten({
        title: {
          en: 'Here is the title'
        }
      });

      expect(flat).toEqual({
        Titre: 'Here is the title'
      });
    });

    test('multilingual field with specified possible languages does not provide other flat values than for said languages', () => {
      const map = [multilingual({
        languages: ['en', 'it', 'fr', 'es'],
      }, {
        source: 'country',
        possibleLanguages: ['fr', 'en']
      })];

      const flatten = flattener(map);

      const flat = flatten({
        country: {
          en: 'Iceland',
          fr: 'Islande'
        }
      });

      expect(flat).toEqual({
        'country - FR': 'Islande',
        'country - EN': 'Iceland'
      });
    });

    test('multilingual field passes data in post parser', () => {
      const map = [multilingual({
        languages: ['fr', 'en']
      }, {
        source: 'some_field',
        postParse: v => v.join('|')
      })];

      const flatten = flattener(map);

      const flat = flatten({
        some_field: {
          en: ['a', 'field'],
          fr: []
        }
      });

      expect(flat).toEqual({
        'some_field - FR': null,
        'some_field - EN': 'a|field'
      });
    });

    test('multilingual field spreads result over multiple fields if language is not set', () => {
      const map = [multilingual({
        languages: ['fr', 'en', 'it']
      }, {
        source: 'title'
      })];

      const flatten = flattener(map);

      const flat = flatten({
        title: {
          fr: 'Vente A Emporter',
          en: 'Takeaway'
        }
      });

      expect(flat).toEqual({
        'title - FR': 'Vente A Emporter',
        'title - EN': 'Takeaway',
        'title - IT': null
      });
    });
  });
});
