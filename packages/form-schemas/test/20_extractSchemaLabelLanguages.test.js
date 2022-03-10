'use strict';

const extractSchemaLabelLanguages = require('../client/src/FormSchemaBuilder/lib/extractSchemaLabelLanguages');

describe('unit - extractSchemaLabelLanguages', () => {
  it('ignores empty labels', () => {
    const languages = extractSchemaLabelLanguages({
      fields: [{
        label: {
          fr: 'Un champ',
          en: 'Un autre champ',
          pl: ''
        }
      }, {
        label: {
          fr: 'Oui',
          en: 'Yes'
        }
      }]
    });

    expect(languages).toEqual(['fr', 'en']);
  });

  it('options of optioned fields are taken into account in evaluation', () => {
    const languages = extractSchemaLabelLanguages({
      fields: [{
        label: 'Un champ'
      }, {
        label: { fr: 'Un autre champ' }
      }, {
        label: 'Encore un champ',
        options: [{
          label: {
            en: 'A field'
          }
        }]
      }]
    });

    expect(languages).toEqual(['fr', 'en']);
  });
});
