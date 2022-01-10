'use strict';

const labels = require('@openagenda/labels/event/exportFieldNames');
const { getFlattener } = require('../lib/transform');

const event = require('./fixtures/sortir-a-boulogne-billancourt.json');

const simpleFormSchema = {
  fields: [{
    field: 'description',
    fieldType: 'text',
    languages: [],
    label: {
      fr: 'Chapô'
    }
  }]
};

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

    test('flatten registration info', () => {
      expect(flat.Inscription).toEqual('http://www.cnjeu.fr/, 0145707532, reservation@email.com');
    });

    test('Location phone is part of result', () => {
      expect(flat['Téléphone du lieu']).toEqual(event.location.phone);
    });

    test('dateRange is part of result', () => {
      expect(
        Object.keys(flat)
          .filter(item => (
            ['Résumé horaires - FR', 'Résumé horaires - EN'].includes(item)
          )).length
      ).toEqual(2);
    });

    test('firstDate and lastDate are part of result', () => {
      expect(flat['Première date - FR']).toEqual('mercredi 8 mars 2017');
      expect(flat['Dernière date - FR']).toEqual('jeudi 21 décembre 2017');
    });

    test('keywords are "|" separated', () => {
      expect(flat['Mots clés - FR']).toEqual('Expo | Jeu');
    });

    test('state is part of result', () => {
      expect(flat.Statut).toEqual('Published');
    });
  });

  describe('flatten specific fields', () => {
    let flat;
    beforeAll(() => {
      const flatten = getFlattener({
        lang: 'fr',
        languages: ['fr', 'en'],
        labels,
        includeFields: ['title', 'uid'],
        includeLanguages: ['fr']
      });
      flat = flatten(event);
    });

    test('filtered fields', () => {
      expect(Object.keys(flat)).toEqual(['Identifiant', 'Titre - FR']);
    });
  });

  describe('flattener with formSchema', () => {
    test('if a standard field is decorated with specific labels, those are used in export', () => {
      const flatten = getFlattener({
        lang: 'fr',
        languages: ['fr'],
        labels,
        formSchema: simpleFormSchema
      });

      const flat = flatten(event);

      expect(flat['Chapô - FR']).toEqual(event.description.fr);
    });

    test('dateRange is part of result of a flatten with formSchema', () => {
      const flatten = getFlattener({
        lang: 'fr',
        languages: ['fr'],
        labels,
        formSchema: simpleFormSchema,
        maintainedFields: ['dateRange']
      });

      const flat = flatten(event);

      expect(
        Object.keys(flat)
          .filter(item => ['Résumé horaires'].includes(item))
          .length
      ).toEqual(1);
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

  describe('Get headers', () => {
    let headers;
    beforeAll(() => {
      const flatten = getFlattener({
        lang: 'fr',
        languages: ['fr', 'en'],
        labels,
        includeFields: ['title', 'uid', 'timings'],
        includeLanguages: ['fr']
      });
      headers = flatten.getHeaders(event);
    });

    test('return only headers', () => {
      expect(headers).toEqual([
        { source: 'uid', target: 'Identifiant' },
        { source: 'title', target: ['Titre - FR'] },
        {
          source: 'timings',
          target: [
            'Horaires ISO',
            'Horaires détaillés - FR',
          ],
        }
      ]);
    });
  });
});
