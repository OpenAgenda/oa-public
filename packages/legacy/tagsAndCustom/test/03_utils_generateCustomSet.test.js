'use strict';

const fs = require('node:fs');

const generateCustomFields = require('../lib/utils/generateCustomSet');
const maisonDesAines = require('./fixtures/schemas/maison-des-aines.json');
const reedexpo = require('./fixtures/schemas/reedexpo.json');

const fixtures = {
  maisonDesAines,
  reedexpo,
};

function _get(fixtureFile) {
  return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/${fixtureFile}`, 'utf-8'));
}

describe('03 - utils - generateCustomSet', () => {
  it('schema to text custom field', () => {
    expect(generateCustomFields(
      _get('schemas/text.json'),
    ).customFields).toEqual(
      _get('customSets/text.json'),
    );
  });

  it('schema to number custom field', () => {
    expect(generateCustomFields(
      _get('schemas/number.json'),
    ).customFields).toEqual(
      _get('customSets/number.json'),
    );
  });

  it('schema boolean to checkbox custom field', () => {
    expect(generateCustomFields(
      _get('schemas/boolean.json'),
    ).customFields).toEqual(
      _get('customSets/checkbox.json'),
    );
  });

  it('schema phone to text custom field', () => {
    expect(generateCustomFields(
      _get('schemas/phone.json'),
    ).customFields).toEqual(
      _get('customSets/textFromPhone.json'),
    );
  });

  it('if read right is administrator and moderator, custom field should be administrator', () => {
    const { customFields } = generateCustomFields({
      fields: [{
        field: 'Montant',
        fieldType: 'integer',
        label: 'Somme proposée à la commission',
        read: ['administrator', 'moderator'],
        origin: 'custom',
      }],
    });
    expect(customFields[0].type).toBe('administrator');
  });

  it('if read right is administrator, moderator and contributor, custom field should be private', () => {
    const { customFields } = generateCustomFields({
      fields: [{
        field: 'Présentation',
        fieldType: 'file',
        extensions: ['pdf'],
        read: ['administrator', 'moderator', 'contributor'],
        label: 'Vous pouvez également charger ici une présentation de votre événement, elle ne sera visible que des délégations et pas du grand public.',
        origin: 'custom',
      }],
    });
    expect(customFields[0].type).toBe('private');
  });

  it('fix: maison des aines (villeneuve d\'ascq should see', () => {
    const { customFields } = generateCustomFields(fixtures.maisonDesAines);

    expect(customFields.map(f => f.name)).toEqual(['interetintercommunal', 'recurringevent']);
  });

  it('if origin is unspecified and field could be custom, field is included in custom fields', () => {
    const { customFields } = generateCustomFields(fixtures.reedexpo);
    expect(customFields.filter(f => f.name === 'year').length).toBe(1);
  });
});
