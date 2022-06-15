import ih from 'immutability-helper';
import reedFixtures from './fixtures/reed.json';

import getMultilingualFieldNames from '../src/utils/getMultilingualFieldNames';
import transferMultilingualValues from '../src/utils/transferMultilingualValues';
import removeMultilingualValues from '../src/utils/removeMultilingualValues';
import identifyLanguageChanges from '../src/utils/identifyLanguageChanges';
import getTimingsSpan from '../src/utils/getTimingsSpan';
import flattenLocationTagSet from '../src/utils/flattenLocationTagSet';
import schemaLanguages from '../src/utils/schemaLanguages';
import extractLanguages from '../src/utils/extractLanguages';

describe('event-form utils unit tests', () => {

  describe('extractLanguages', () => {
    test('required languages are included', () => {
      const languages = extractLanguages(reedFixtures.schema, {
        title: { fr: 'Un titre' }
      }, { defaultLanguage: 'en' });

      expect(languages).toEqual(['fr', 'en']);
    });

    test('other languages provided in values are added to required languages', () => {
      const languages = extractLanguages(reedFixtures.schema, {
        title: { es: 'Un titulo' }
      }, { defaultLanguage: 'it' })
      
      expect(languages).toEqual(['fr', 'en', 'es']);
    });

    test('if schema is not provided, standard multilingual fields are used to detect defined languages', () => {
      const languages = extractLanguages(null, {
        title: { es: 'Un titulo' }
      }, { defaultLanguage: 'it' });

      expect(languages).toEqual(['es']);
    });

    test('if multilingual fields are presented as strings, they cannot be used to derive language. Default is used', () => {
      const languages = extractLanguages(null, {
        title: 'A title'
      }, { defaultLanguage: 'en' });

      expect(languages).toEqual(['en']);
    });

    test('if no values are presented and default languages are defined, they are applied', () => {
      const languages = extractLanguages({
        fields: [{
          field: 'languages',
          fieldType: 'languages',
          default: ['fr', 'en']
        }]
      }, {});

      expect(languages).toEqual(['fr', 'en']);
    });
  });

  describe('schemaLanguages', () => {

    const schema = {
      fields: [{
        field: 'one',
        languages: []
      }, {
        field: 'two'
      }, {
        field: 'languages'
      }, {
        field: 'three',
        languages: []
      }]
    };

    // language validator should validate differently depending on languages field config.

    test('languages defined by values are used in priority', () => {

      const languagedSchema = schemaLanguages.set(schema, null, ['it', 'en']);

      expect(languagedSchema).toEqual({
        fields: [{
          field: 'one',
          languages: ['it', 'en']
        }, {
          field: 'two'
        }, {
          field: 'languages',
        }, {
          field: 'three',
          languages: ['it', 'en']
        }]
      });

    });

    it('if no value languages are defined and interface value is provided, it is used', () => {

      const languagedSchema = schemaLanguages.set(schema, 'is', []);

      expect(languagedSchema).toEqual({
        fields: [{
          field: 'one',
          languages: ['is']
        }, {
          field: 'two'
        }, {
          field: 'languages',
        }, {
          field: 'three',
          languages: ['is']
        }]
      });

    });

    it('if no value languages are defined and default values are set, they are used independently of interface language', () => {

      const schemaWithDefaultLanguages = ih(schema, {
        fields : { 2: { default: { $set: ['it', 'de'] } } }
      });

      const languagedSchema = schemaLanguages.set(schemaWithDefaultLanguages, 'is', []);

      expect(languagedSchema).toEqual({
        fields: [{
          field: 'one',
          languages: ['it', 'de']
        }, {
          field: 'two'
        }, {
          field: 'languages',
          default: ['it', 'de']
        }, {
          field: 'three',
          languages: ['it', 'de']
        }]
      });

    });


    it('if required languages exist they should be set independently of value languages', () => {

      const schemaWithDefaultLanguages = ih(schema, {
        fields : { 2: { required: { $set: ['it', 'de'] } } }
      });

      const languagedSchema = schemaLanguages.set(schemaWithDefaultLanguages, 'is', ['es']);

      expect(languagedSchema).toEqual({
        fields: [{
          field: 'one',
          languages: ['it', 'de', 'es']
        }, {
          field: 'two'
        }, {
          field: 'languages',
          required: ['it', 'de']
        }, {
          field: 'three',
          languages: ['it', 'de', 'es']
        }]
      });

    });

    it('if required languages are strict, they are always set', () => {

      const schemaWithDefaultLanguages = ih(schema, {
        fields : { 2: {
          required: { $set: ['it', 'de'] },
          strict: { $set: true }
        } }
      });

      const languagedSchema = schemaLanguages.set(schemaWithDefaultLanguages, 'is', ['es']);

      expect(languagedSchema).toEqual({
        fields: [{
          field: 'one',
          languages: ['it', 'de']
        }, {
          field: 'two'
        }, {
          field: 'languages',
          required: ['it', 'de'],
          strict: true
        }, {
          field: 'three',
          languages: ['it', 'de']
        }]
      });

    });

  });


  test('getMultilingualFieldNames', () => {

    expect(getMultilingualFieldNames({
      fields: [{
        field: 'notmulti'
      }, {
        field: 'multi',
        languages: []
      }]
    })).toEqual(['multi']);

  });

  test('removeMultilingualValues', () => {

    expect(removeMultilingualValues({
      "accessibility":{"hi":true,"sl":true},
      "references":[45527593],
      "timings":[{"begin":{"date":"2018-11-27","hours":10,"minutes":10},"end":{"date":"2018-11-27","hours":16,"minutes":16}}],
      "languages":["de","fr"],
      "title":{"de":"deuuu","fr":"frrrrr"}
    }, ['title', 'description', 'keywords', 'longDescription', 'conditions'], ['de']
   )).toEqual({
      "accessibility":{"hi":true,"sl":true},
      "references":[45527593],
      "timings":[{"begin":{"date":"2018-11-27","hours":10,"minutes":10},"end":{"date":"2018-11-27","hours":16,"minutes":16}}],
      "languages":["de","fr"],
      "title":{"fr":"frrrrr"}
    });

  });

  test('transferMultilingualValues - transfering language values', () => {

    expect(transferMultilingualValues({
      notmulti: 'A value',
      multi: {
        fr: 'Une valeur multilingue'
      },
      multi_2: {
        fr: 'Une autre valeur'
      }
    }, ['multi', 'multi_2'], 'fr', 'is')).toEqual({
      notmulti: 'A value',
      multi: {
        is: 'Une valeur multilingue'
      },
      multi_2: {
        is: 'Une autre valeur'
      }
    });

  });

  test('identifyLanguageChanges - changing a language', () => {

    expect(identifyLanguageChanges(['fr'], ['es'])).toEqual({
      has: true,
      added: ['es'],
      removed: ['fr'],
      swapped: ['es']
    });

  });

  test('given a list of timings, returns in ms the time between the first begin time and the last end time', () => {

    const ms = getTimingsSpan([{
      begin: '2018-12-24T10:00:00.0002',
      end: '2018-12-24T11:00:00.0002'
    }, {
      begin: '2018-12-31T09:00:00.0002',
      end: '2018-12-31T22:00:00.0002'
    }, {
      begin: '2018-12-24T15:00:00.0002',
      end: '2018-12-24T19:00:00.0002'
    }, {
      begin: '2018-12-25T09:00:00.0002',
      end: '2018-12-25T10:00:00.0002'
    }]);

    expect(ms / 1000 / 60 / 60 / 24).toEqual(7.5);

  });


  test('Location legacy settings can contain tag sets. Function takes tag set labels and flattens them', () => {

    const flattened = flattenLocationTagSet({
      groups: [{
        name: {
          fr : 'Un label',
          en : 'A Label'
        },
        info: null,
        tags: [{
          id: 50,
          label: 'Architecture'
        }, {
          id: 38,
          label: {
            fr: 'Jardin',
            en: 'Garden'
          }
        }]
      }]
    }, 'fr');

    expect(flattened).toEqual({
      groups: [{
        name: 'Un label',
        info: null,
        tags: [{
          id: 50,
          label: 'Architecture'
        }, {
          id: 38,
          label: 'Jardin'
        }]
      }]
    });

  });

});
