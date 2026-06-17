/* eslint jest/expect-expect: ["warn", { "assertFunctionNames": ["expect", "assertValid"] }] */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

// Pins the FormSchemaField contract against the descriptor kinds the form
// engine actually emits — notably section separators, which carry NO `field`
// key (a `required: [field]` regression would reject them).
const specPath = fileURLToPath(
  import.meta.resolve('@openagenda/api-spec/openapi.yaml'),
);
const spec = parse(readFileSync(specPath, 'utf8'));

function buildValidator(ref) {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  ajv.addSchema(spec, 'openapi');
  return ajv.getSchema(`openapi#/components/schemas/${ref}`);
}

const validateField = buildValidator('FormSchemaField');
const validateSchema = buildValidator('EventFormSchema');

function assertValid(validate, body, label) {
  const ok = validate(body);
  if (!ok) {
    throw new Error(
      `${label} failed schema:\n${JSON.stringify(validate.errors, null, 2)}\n`
        + `body:\n${JSON.stringify(body, null, 2)}`,
    );
  }
  expect(ok).toBe(true);
}

describe('90 - api-v3 unit - FormSchemaField contract', () => {
  it('accepts a section separator (type: section, no field key)', () => {
    assertValid(
      validateField,
      {
        type: 'section',
        slug: 'practical-info',
        label: { fr: 'Infos pratiques', en: 'Practical info' },
        display: true,
      },
      'section descriptor',
    );
  });

  it('accepts a native field with an object-form enableWith', () => {
    assertValid(
      validateField,
      {
        field: 'onlineAccessLink',
        fieldType: 'link',
        label: { fr: 'Lien en ligne' },
        optional: false,
        enableWith: { field: 'attendanceMode', value: [2, 3] },
        schemaId: null,
        schemaType: 'event',
      },
      'enableWith object descriptor',
    );
  });

  it('accepts an additional field with enable/display/origin extras', () => {
    assertValid(
      validateField,
      {
        field: 'thematique',
        fieldType: 'radio',
        label: { fr: 'Thématique' },
        enable: true,
        display: false,
        origin: 'tags',
        enableWith: 'image',
        options: [{ id: 42, value: 'concert', label: { fr: 'Concert' } }],
        schemaId: 10522,
        schemaType: 'agenda',
        anyEngineKey: { passes: 'through' },
      },
      'additional field descriptor',
    );
  });

  it('accepts a schema mixing sections and data fields', () => {
    assertValid(
      validateSchema,
      {
        fields: [
          { type: 'section', slug: 'about', label: 'About' },
          { field: 'title', fieldType: 'multilingual', optional: false },
        ],
        custom: {},
      },
      'mixed schema',
    );
  });
});
