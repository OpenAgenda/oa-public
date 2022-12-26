'use strict';

const tagSetToFormSchema = require('..');
const locationTagSet = require('./fixtures/JEP.locationTagSet.json');
const locationFormSchema = require('./fixtures/JEP.locationFormSchema.json');

describe('tagsetToFormSchema', () => {
  it('converts to form-schema', () => {
    expect(
      tagSetToFormSchema(locationTagSet),
    ).toEqual(
      locationFormSchema,
    );
  });
});
