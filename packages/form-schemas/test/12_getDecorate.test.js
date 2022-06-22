'use strict';

const getDecorate = require('../iso/getDecorate');

describe('extended events - functional (iso): getDecorate', () => {
  let decorate;

  beforeAll(() => {
    decorate = getDecorate([{
      field: 'atextfield',
      label: { fr: 'Un champ texte' },
      fieldType: 'text',
    }, {
      field: 'anotherfield',
      label: {
        en: 'A number',
        fr: 'Un nombre'
      },
      fieldType: 'number',
      min: 2,
    }, {
      field: 'andanotherfield',
      label: {
        en: 'A choice',
        fr: 'Un choix',
      },
      fieldType: 'radio',
      options: [{
        id: 123,
        value: 'option-1',
        label: { fr: 'Option 1' },
      }, {
        id: 456,
        value: 'option-2',
        label: { fr: 'Option 2' },
      }],
    }, {
      field: 'multiplechoicefield',
      label: {
        en: 'A multiple choice',
        fr: 'Un choix multiple'
      },
      fieldType: 'checkbox',
      options: [{
        id: 789,
        value: 'checkbox-1',
        label: {
          fr: 'La checkbox 1'
        }
      }, {
        id: 101112,
        value: 'checkbox-2',
        label: {
          en: 'Checkbox 2',
          fr: 'La checkbox 2'
        },
      }, {
        id: 101222,
        value: 'checkbox-3',
        label: {
          en: 'Checkbox 3',
          fr: 'La checkbox 3'
        },
      }],
    }, {
      field: 'animage',
      fieldType: 'image',
      label: 'An image'
    }]);
  });

  it('returns a decorated object', () => {
    const decorated = decorate({
      anotherfield: 12,
      andanotherfield: 123,
      multiplechoicefield: [789, 101222],
      animage: {
        filename: 'fhdjqhfjdkql.png',
        originalName: 'A file.png',
        extension: 'jpg'
      }
    });

    expect(decorated).toStrictEqual({
      anotherfield: 12,
      andanotherfield: {
        id: 123,
        value: 'option-1',
        label: {
          fr: 'Option 1'
        }
      },
      multiplechoicefield: [
        {
          id: 789,
          value: 'checkbox-1',
          label: {
            fr: 'La checkbox 1'
          }
        },
        {
          id: 101222,
          value: 'checkbox-3',
          label: {
            en: 'Checkbox 3',
            fr: 'La checkbox 3'
          }
        }
      ],
      animage: {
        filename: 'fhdjqhfjdkql.png',
        originalName: 'A file.png',
        extension: 'jpg'
      }
    });
  });

  it('returns a decorated object with flattened labels', () => {
    const decorated = decorate({
      anotherfield: 12,
      andanotherfield: 123,
      multiplechoicefield: [789, 101222],
    }, { lang: 'en' });

    expect(decorated).toStrictEqual({
      anotherfield: 12,
      andanotherfield: {
        id: 123,
        value: 'option-1',
        label: 'Option 1'
      },
      multiplechoicefield: [
        {
          id: 789,
          value: 'checkbox-1',
          label: 'La checkbox 1'
        },
        {
          id: 101222,
          value: 'checkbox-3',
          label: 'Checkbox 3'
        }
      ]
    });
  });

  it('returns a decorated object with labels as keys', () => {
    const decorated = decorate({
      anotherfield: 12,
      andanotherfield: 123,
      multiplechoicefield: [789, 101222],
    }, { labelsAsKeys: true });

    expect(decorated).toStrictEqual({
      'A number': 12,
      'A choice': {
        id: 123,
        value: 'option-1',
        label: 'Option 1'
      },
      'A multiple choice': [
        {
          id: 789,
          value: 'checkbox-1',
          label: 'La checkbox 1'
        },
        {
          id: 101222,
          value: 'checkbox-3',
          label: 'Checkbox 3'
        }
      ]
    });
  });

  it('returns a decorated object with labels as values', () => {
    const decorated = decorate({
      anotherfield: 12,
      andanotherfield: 123,
      multiplechoicefield: [789, 101222],
      animage: {
        filename: 'fhdjqhfjdkql.png',
        originalName: 'A file.png',
        extension: 'jpg'
      }
    }, {
      labelsAsKeys: true,
      labelsAsValues: true
    });

    expect(decorated).toStrictEqual({
      'A number': 12,
      'A choice': 'Option 1',
      'A multiple choice': ['La checkbox 1', 'Checkbox 3'],
      'An image': {
        extension: 'jpg',
        filename: 'fhdjqhfjdkql.png',
        originalName: 'A file.png'
      }
    });
  });

  it('excludes object values from decorated object', () => {
    const decorated = decorate({
      anotherfield: 12,
      andanotherfield: 123,
      multiplechoicefield: [789, 101222],
      animage: {
        filename: 'fhdjqhfjdkql.png',
        originalName: 'A file.png',
        extension: 'jpg'
      }
    }, {
      labelsAsKeys: true,
      labelsAsValues: true,
      ignoreNonArrayObjects: true
    });

    expect(decorated).toStrictEqual({
      'A number': 12,
      'A choice': 'Option 1',
      'A multiple choice': ['La checkbox 1', 'Checkbox 3']
    });
  });
});
