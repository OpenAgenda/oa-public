import monolingualizeSchema from '../client/src/FormSchemaBuilder/lib/monolingualizeSchema.js';
import extractSchemaLabelLanguages from '../client/src/FormSchemaBuilder/lib/extractSchemaLabelLanguages.js';
import multilingualSchema from './fixtures/multilingual.schema.json' with { type: 'json' };

describe('monolingualizeSchema', () => {
  let mono;

  beforeAll(() => {
    mono = monolingualizeSchema(multilingualSchema);
  });
  it('successfully monolingualizes', () => {
    expect(extractSchemaLabelLanguages(mono)).toEqual([]);
  });

  it('field options are monolingualized too', () => {
    expect(
      mono.fields.find(
        (field) => field.field === 'type-devenement-institutions',
      ).options[0].label,
    ).toBe('Evenements');
  });

  it('already monolingual values stay monolingual', () => {
    expect(
      mono.fields.find((field) => field.field === 'id-secutix').label,
    ).toBe('ID Secutix');
  });

  it('multilingual values are flattened using label from multilingual origin', () => {
    expect(
      mono.fields.find(
        (field) => field.field === 'type-devenement-institutions',
      ).label,
    ).toBe("Type d'événement Institutions");
  });
});
