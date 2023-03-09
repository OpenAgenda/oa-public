'use strict';

const flattenSchema = require('../client/src/iso/flattenSchema');

const schema = {
  fields: [{
    field: 'title',
    fieldType: 'text',
    label: 'Titre',
  }, {
    field: 'location',
    label: 'Lieu',
    schema: {
      fields: [{
        field: 'name',
        fieldType: 'text',
        label: 'Nom',
      }, {
        field: 'region',
        fieldType: 'text',
      }],
    },
  }],
};

describe('flattenSchema', () => {
  it('basic case', () => {
    const flatSchema = flattenSchema(schema);

    expect(flatSchema).toEqual({
      fields: [
        { field: 'title', fieldType: 'text', label: 'Titre' },
        { field: 'location.name', fieldType: 'text', label: 'Nom' },
        { field: 'location.region', fieldType: 'text' },
      ],
    });
  });

  it('prefixedLabels option', () => {
    const flatSchema = flattenSchema(schema, {
      prefixedLabels: true,
    });

    expect(flatSchema).toEqual({
      fields: [
        { field: 'title', fieldType: 'text', label: 'Titre' },
        { field: 'location.name', fieldType: 'text', label: 'Lieu: Nom' },
        { field: 'location.region', fieldType: 'text' },
      ],
    });
  });

  it('prefixedLabels option on multilingual labels', () => {
    const flatSchema = flattenSchema({
      fields: [{
        field: 'title',
        fieldType: 'text',
        label: 'Titre',
      }, {
        field: 'location',
        label: 'Lieu',
        schema: {
          fields: [{
            field: 'name',
            fieldType: 'text',
            label: { fr: 'Nom', en: 'Name' },
          }],
        },
      }],
    }, {
      prefixedLabels: true,
    });

    expect(flatSchema.fields[1].label).toEqual({
      fr: 'Lieu: Nom',
      en: 'Lieu: Name',
    });
  });
});
