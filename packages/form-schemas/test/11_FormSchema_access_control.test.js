'use strict';

const FormSchema = require('../iso/FormSchema');

describe('FormSchema - access control', () => {
  let s;

  beforeAll(() => {
    s = new FormSchema({
      fields: [{
        label: { fr: 'un label' },
        field: 'anopenfield',
        fieldType: 'text'
      }, {
        label: { fr: 'un label' },
        field: 'alimitedfield',
        fieldType: 'integer',
        read: 'administrator'
      }, {
        label: { fr: 'un label' },
        field: 'anotherlimitedfield',
        fieldType: 'number',
        read: 'moderator'
      }],
      custom: null
    });
  });

  it(
    'validator with access type specified but no level returns open fields only',
    () => {
      const v = s.getValidate('read');

      expect(v({
        anopenfield: 'Absolom',
        alimitedfield: 2022,
        anotherlimitedfield: 8.5
      })).toStrictEqual({
        anopenfield: 'Absolom'
      });
    }
  );

  it('validator is used to clean data to specified read access', () => {
    const v = s.getValidate('read', 'administrator');

    expect(v({
      anopenfield: 'Absolom',
      alimitedfield: 2022,
      anotherlimitedfield: 8.5
    })).toStrictEqual({
      anopenfield: 'Absolom',
      alimitedfield: 2022
    });
  });

  it(
    'validator is used to keep data strictly matching specified level',
    () => {
      const v = s.getValidate('read', 'administrator', { includeUnspecified: false });

      expect(v({
        anopenfield: 'Plastic bag',
        alimitedfield: 123,
        anotherlimitedfield: 12.3
      })).toStrictEqual({
        alimitedfield: 123
      });
    }
  );

  it('validator can return data matching multiple levels', () => {
    const v = s.getValidate('read', ['administrator', 'moderator'], { includeUnspecified: false });

    expect(v({
      anopenfield: 'Trash',
      alimitedfield: 666,
      anotherlimitedfield: 4.5
    })).toStrictEqual({
      alimitedfield: 666,
      anotherlimitedfield: 4.5
    });
  });
});
