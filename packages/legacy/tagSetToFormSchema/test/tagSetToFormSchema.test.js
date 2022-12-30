'use strict';

const tagSetToFormSchema = require('..');
const locationTagSet = require('./fixtures/JEP.locationTagSet.json');
const locationFormSchema = require('./fixtures/JEP.locationFormSchema.json');

describe('tagSetToFormSchema', () => {
  it('converts to form-schema', () => {
    expect(
      tagSetToFormSchema(locationTagSet),
    ).toEqual(
      locationFormSchema,
    );
  });

  it('converts to form-schema and add schemaId key', () => {
    tagSetToFormSchema(locationTagSet, { schemaId: 'location' }).fields.forEach(f => {
      expect(f.schemaId).toBe('location');
    });
  });

  it('convertLocation converts location tags to formSchema additional fields', () => {
    const taggedLocation = {
      tags: [{
        id: 3,
        label: 'Édifice religieux',
      }, {
        id: 42,
        label: 'Monument historique',
      }],
    };

    expect(
      tagSetToFormSchema.locationAppendAdditionalValues(taggedLocation, locationFormSchema),
    ).toEqual({
      ...taggedLocation,
      'types-de-lieu': [3],
      'protections-appellation-et-labels': [42],
    });
  });
});
