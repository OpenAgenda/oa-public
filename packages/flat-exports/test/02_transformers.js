'use strict';

const Flattener = require('../lib/transform/Flattener');
const timings = require('../lib/transform/timings');
const multilingual = require('../lib/transform/multilingual');
const accessibility = require('../lib/transform/accessibility');
const formatTime = require('../lib/transform/formatTime');
const image = require('../lib/transform/image');
const fieldToFlattenerMapItem = require('../lib/transform/fieldToFlattenerMapItem');
const decorateFieldMap = require('../lib/transform/decorateFieldMap');
const getDefaultFieldMap = require('../lib/transform/getDefaultFieldMap');

describe('flat-exports - unit - transforms', () => {
  describe('fieldToFlattenerMapItem', () => {
    test('multilingual field to flattener map item', () => {
      expect(
        fieldToFlattenerMapItem({
          languages: [],
          field: 'description',
          fieldType: 'text',
          optional: false,
          max: 200,
          label: {
            fr: 'Description courte',
            en: 'Short description',
            it: 'Breve descrizione'
          }
        }, { lang: 'fr', languages: ['fr', 'en'] })
      ).toEqual({
        source: 'description',
        target: ['Description courte - FR', 'Description courte - EN'],
        languages: ['fr', 'en']
      });
    });

    test('text field to flattened map item', () => {
      expect(
        fieldToFlattenerMapItem({
          field: 'imageCredits',
          fieldType: 'text',
          label: {
            fr: "Crédits de l'image",
            en: 'Image credits',
            it: "Crediti d'immagine"
          }
        }, { lang: 'fr' })
      ).toEqual({
        source: 'imageCredits',
        target: 'Crédits de l\'image'
      });
    });

    test('optioned field to flattener map item', () => {
      expect(
        fieldToFlattenerMapItem({
          field: 'status',
          fieldType: 'select',
          default: 1,
          display: false,
          label: {
            fr: 'État',
            en: 'Status'
          },
          options: [
            {
              id: 1,
              value: 'scheduled',
              label: {
                fr: 'Programmé',
                en: 'Scheduled'
              }
            },
            {
              id: 4,
              value: 'cancelled',
              label: {
                fr: 'Annulé',
                en: 'Cancelled'
              }
            }
          ],
          schemaId: null,
          schemaType: 'event'
        }, { lang: 'fr', languages: [] })
      ).toEqual({
        hasOptions: true,
        source: 'status',
        target: 'État',
        transform: {
          1: 'Programmé',
          4: 'Annulé'
        }
      });
    });
  });

  describe('decorateFieldMap', () => {
    test('adds additional fields provided by schema at the end of the map items', () => {
      expect(
        decorateFieldMap([
          {
            source: 'uid',
            target: 'Identifiant'
          },
          {
            source: 'title',
            target: ['Titre - FR', 'Titre - EN']
          },
          {
            source: 'description',
            target: ['Description - FR', 'Description - EN']
          }
        ], {
          formSchema: {
            fields: [
              {
                field: 'type-devenement',
                label: "Type d'événement",
                related: [],
                options: [{
                  id: 1,
                  label: 'Concert'
                }],
                fieldType: 'radio'
              }
            ]
          },
          languages: ['fr', 'en'],
          lang: 'fr'
        })
      ).toEqual(
        [
          { source: 'uid', target: 'Identifiant' },
          { source: 'title', target: ['Titre - FR', 'Titre - EN'] },
          {
            source: 'description',
            target: ['Description - FR', 'Description - EN']
          },
          {
            hasOptions: true,
            source: 'type-devenement',
            target: 'Type d\'événement',
            transform: { 1: 'Concert' }
          }
        ]
      );
    });
  });

  describe('timings', () => {
    test('transformer spreads detailed timings over one ISO column and multiple language-specific columns', () => {
      const map = [timings({
        languages: ['fr', 'en']
      }, {})];

      const flatten = Flattener(map);

      const flat = flatten({
        timings: [{
          begin: '2017-03-16T09:30:00+01:00',
          end: '2017-03-16T12:00:00+01:00'
        }]
      });

      expect(flat).toEqual({
        ISO: '2017-03-16T09:30:00+01:00 -> 2017-03-16T12:00:00+01:00',
        'timings - FR': 'jeudi 16 mars 2017 - 09:30 ⤏ 12:00',
        'timings - EN': 'Thursday 16 March 2017 - 09:30 ⤏ 12:00'
      });
    });

    test('transformer displays times in timezone explicited in source data', () => {
      const map = [timings({
        languages: ['fr', 'en']
      }, {})];

      const flatten = Flattener(map);

      const flat = flatten({
        timezone: 'Europe/London',
        timings: [{
          begin: '2022-04-03T09:00:00.000Z',
          end: '2022-04-03T10:00:00.000Z'
        }]
      });

      expect(flat).toEqual({
        ISO: '2022-04-03T09:00:00.000Z -> 2022-04-03T10:00:00.000Z',
        'timings - FR': 'dimanche 3 avril 2022 - 10:00 ⤏ 11:00',
        'timings - EN': 'Sunday 3 April 2022 - 10:00 ⤏ 11:00'
      });
    });

    test('transformer concatenates timings which occur in the same day', () => {
      const map = [timings({
        languages: ['fr']
      }, {})];

      const flatten = Flattener(map);

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
        timings: 'jeudi 16 mars 2017 - 09:30 ⤏ 12:00, 14:30 ⤏ 22:00 | vendredi 17 mars 2017 - 09:30 ⤏ 12:00'
      });
    });
  });

  describe('accessibility', () => {
    test('transformer returns single language when language is specified and available in labels', () => {
      const map = [accessibility({
        languages: ['fr']
      }, {})];

      const flatten = Flattener(map);

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

      const flatten = Flattener(map);

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

      const flatten = Flattener(map);

      const flat = flatten({
        accessibility: { vi: true, pi: false, hi: false }
      });

      expect(flat).toEqual({
        Accessibilité: 'Handicap visuel'
      });
    });
  });

  describe('multilingual', () => {
    test('multilingual field returns single value configuration when one language is specified', () => {
      const map = [multilingual({
        languages: ['fr']
      }, {
        source: 'title'
      })];

      const flatten = Flattener(map);

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

      const flatten = Flattener(map);

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

      const flatten = Flattener(map);

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

      const flatten = Flattener(map);

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

      const flatten = Flattener(map);

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

  describe('formatTime', () => {
    test('transformer returns formatted time in each language given', () => {
      const map = [formatTime({ languages: ['en', 'it', 'fr', 'es'], includeLanguages: ['en', 'fr'] }, { source: 'updatedAt', target: 'Dernière mise à jour' })];

      const flatten = Flattener(map);

      const flat = flatten({
        updatedAt: '2020-09-29T01:05:11.000Z'
      });

      expect(flat).toEqual({
        'Dernière mise à jour - EN': 'Tuesday 29 September 2020',
        'Dernière mise à jour - FR': 'mardi 29 septembre 2020'
      });
    });
  });

  describe('image transformer', () => {
    test('transformer returns the full image url', () => {
      const map = [image({ target: 'image', source: 'image', type: 'image' })];

      const flatten = Flattener(map);

      const flat = flatten({
        image: {
          filename: 'ceci-est-une-image.jpg',
          base: 'https://cibuldev.s3.amazonaws.com/'
        }
      });

      expect(flat).toEqual({
        image: 'https://cibuldev.s3.amazonaws.com/ceci-est-une-image.jpg'
      });
    });
  });

  describe('getDefaultFieldMap', () => {
    test('stripped call returns a field map', () => {
      const fieldMap = getDefaultFieldMap();

      expect(Array.isArray(fieldMap)).toBe(true);
    });
  });
});
