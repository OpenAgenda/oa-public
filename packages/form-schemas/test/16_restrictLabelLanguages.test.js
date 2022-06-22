'use strict';

const restrictLabelLanguages = require('../client/src/FormSchemaBuilder/lib/restrictLabelLanguages');

describe('16 - unit - restrictLabelLanguages', () => {
  it('restricts labels of field to given set of languages', () => {
    expect(restrictLabelLanguages({
      label: {
        fr: 'Titre',
        en: 'Title'
      },
      info: {
        fr: 'Info sur le titre',
        en: 'Info about the title'
      },
      fieldType: 'text'
    }, ['fr', 'es'])).toStrictEqual({
      label: {
        fr: 'Titre',
        es: 'Titre'
      },
      info: {
        fr: 'Info sur le titre',
        es: 'Info sur le titre'
      },
      fieldType: 'text'
    });
  });

  it('turns multilingual to monolingual', () => {
    expect(restrictLabelLanguages({
      label: {
        fr: 'Titre',
        en: 'Title'
      },
      info: {
        fr: 'Info sur le titre',
        en: 'Info about the title'
      },
      fieldType: 'text'
    })).toStrictEqual({
      label: 'Titre',
      info: 'Info sur le titre',
      fieldType: 'text'
    });
  });

  it('turns monolingual to multilingual', () => {
    expect(restrictLabelLanguages({
      label: 'Titre',
      info: 'Info sur le titre',
      fieldType: 'text'
    }, ['fr', 'es'])).toStrictEqual({
      label: {
        fr: 'Titre',
        es: 'Titre'
      },
      info: {
        fr: 'Info sur le titre',
        es: 'Info sur le titre'
      },
      fieldType: 'text'
    });
  });

  it('apply restrict languages to schema', () => {
    expect(restrictLabelLanguages.applyToSchema({
      fields: [{
        label: 'Titre',
        field: 'title',
        fieldType: 'text'
      }, {
        label: 'Description',
        field: 'description',
        fieldType: 'text'
      }]
    }, ['fr'])).toStrictEqual({
      fields: [{
        label: {
          fr: 'Titre'
        },
        field: 'title',
        fieldType: 'text'
      }, {
        label: {
          fr: 'Description'
        },
        field: 'description',
        fieldType: 'text'
      }]
    });
  });
});
