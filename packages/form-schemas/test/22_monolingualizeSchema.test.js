'use strict';

const monolingualizeSchema = require('../client/src/FormSchemaBuilder/lib/monolingualizeSchema');
const extractSchemaLabelLanguages = require('../client/src/FormSchemaBuilder/lib/extractSchemaLabelLanguages');
const multilingualSchema = require('./fixtures/multilingual.schema.json');

describe('monolingualizeSchema', () => {
  let mono;

  beforeAll(() => {
    mono = monolingualizeSchema(multilingualSchema);
  });
  it('successfully monolingualizes', () => {
    expect(extractSchemaLabelLanguages(mono)).toEqual([]);
  });

  it('field options are monolingualized too', () => {
    expect(mono.fields.find(field => field.field === 'type-devenement-institutions').options[0].label).toBe('Evenements');
  });

  it('already monolingual values stay monolingual', () => {
    expect(mono.fields.find(field => field.field === 'id-secutix').label).toBe('ID Secutix');
  });

  it('multilingual values are flattened using label from multilingual origin', () => {
    expect(
      mono.fields
        .find(field => field.field === 'type-devenement-institutions')
        .label
    ).toBe('Type d\'événement Institutions');
  });
});
