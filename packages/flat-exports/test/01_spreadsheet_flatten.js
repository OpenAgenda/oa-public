'use strict';

const labels = require('@openagenda/labels/event/exportFieldNames');
const { getFlattener } = require('../lib/transform');

const event = require('./fixtures/sortir-a-boulogne-billancourt.json');

describe('flat-exports - unit - spreadsheet_flatten', () => {
  describe('default flattener', () => {
    let flat;
    beforeAll(() => {
      const flatten = getFlattener({
        lang: 'fr',
        languages: ['fr', 'en', 'it'],
        labels
      });
      flat = flatten(event);
    });

    test('title is flattened per language', () => {
      expect(flat['Titre - FR']).toEqual(event.title.fr);
    });

    test('keywords are "|" separated', () => {
      expect(flat['Mots clés - FR']).toEqual('Expo | Jeu');
    });
  });

  describe('flattener with formSchema', () => {
    test('if a standard field is decorated with specific labels, those are used in export', () => {
      const flatten = getFlattener({
        lang: 'fr',
        languages: ['fr'],
        labels,
        formSchema: {
          fields: [{
            field: 'description',
            fieldType: 'text',
            languages: [],
            label: {
              fr: 'Chapô'
            }
          }]
        }
      });

      const flat = flatten(event);

      expect(flat['Chapô - FR']).toEqual(event.description.fr);
    });

    test('optioned additional field provides values in requested language', () => {
      const flatten = getFlattener({
        lang: 'fr',
        languages: ['fr'],
        labels,
        formSchema: {
          fields: [{
            field: 'category',
            fieldType: 'radio',
            label: {
              fr: 'Catégorie'
            },
            options: [{
              id: 1,
              value: 'nap',
              label: {
                fr: 'Sieste',
                en: 'Nap'
              }
            }]
          }]
        }
      });

      const flat = flatten({
        category: 1
      });

      expect(flat['Catégorie']).toEqual('Sieste');
    });

    test('optioned additional field with multiple values uses provided separator', () => {
      const flatten = getFlattener({
        lang: 'fr',
        languages: ['fr'],
        labels,
        separator: ' 😊 ',
        formSchema: {
          fields: [{
            field: 'categories',
            fieldType: 'checkbox',
            label: {
              fr: 'Catégories'
            },
            options: [{
              id: 1,
              value: 'fork',
              label: 'Fourchette'
            }, {
              id: 2,
              value: 'toe',
              label: 'Orteil'
            }]
          }]
        }
      });

      const flat = flatten({
        categories: [1, 2]
      });

      expect(flat['Catégories']).toEqual('Fourchette 😊 Orteil');
    });
  });
});
