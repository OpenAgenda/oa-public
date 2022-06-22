'use strict';

const fs = require('fs');

const getValidatorFromField = require('../iso/getValidatorFromField');
const fileValidator = require('../iso/fileValidator');
const getSchema = require('../iso/getSchema');

function _get(name) {
  return JSON.parse(fs.readFileSync(__dirname + '/parse/' + name + '.json', 'utf-8'));
}

describe('file validator', () => {
  it('file by url', () => {
    const validate = fileValidator({
      allowURL: true
    });

    const clean = validate({
      url: '//some.path.net/7839789.txt',
      extension: 'txt',
      originalName: 'someFile.txt',
      filename: '7839789.txt',
    });

    expect(clean).toStrictEqual({
      extension: 'txt',
      originalName: 'someFile.txt',
      filename: '7839789.txt',
      url: '//some.path.net/7839789.txt'
    });
  });

  it('image with size and variants option', () => {
    const validate = fileValidator({
      imageWithSizeAndVariants: true
    });

    const clean = validate({
      filename: 'image.png',
      size: { width: 200, height: 200 },
      variants: [{
        type: 'thumbnail',
        filename: 'thumb.png',
        size: { width: 100, height: 100 }
      }]
    });

    expect(clean).toStrictEqual({
      extension: null,
      originalName: null,
      filename: 'image.png',
      size: { width: 200, height: 200 },
      variants: [{
        type: 'thumbnail',
        filename: 'thumb.png',
        size: { width: 100, height: 100 }
      }]
    });
  });

  it('image with size and variants option but unspecified in value', () => {
    const validate = fileValidator({
      imageWithSizeAndVariants: true
    });

    const clean = validate({
      filename: 'image.png'
    });

    expect(clean).toStrictEqual({
      extension: null,
      originalName: null,
      filename: 'image.png',
      size: { width: null, height: null },
      variants: []
    });
  });
});

describe('deriving validators', () => {
  it('text field to validator', () => {
    expect(getValidatorFromField(_get('text.field'))).toStrictEqual(_get('text.validator'));
  });

  it('radio field to choice validator', () => {
    expect(getValidatorFromField(_get('radio.field'))).toStrictEqual(_get('radio.validator'));
  });

  it('integer field to validator', () => {
    expect(getValidatorFromField(_get('integer.field'))).toStrictEqual(_get('integer.validator'));
  });

  it('select field to choice validator', () => {
    expect(getValidatorFromField(_get('select.field'))).toStrictEqual(_get('select.validator'));
  });

  it('number field to validator', () => {
    expect(getValidatorFromField(_get('number.field'))).toStrictEqual(_get('number.validator'));
  });

  it('multilingual text field to multilingual validator', () => {
    expect(getValidatorFromField(_get('multilingualText.field'))).toStrictEqual(_get('multilingual.validator'));
  });

  it('multilingual textarea field to multilingual validator', () => {
    expect(getValidatorFromField(_get('multilingualTextarea.field'))).toStrictEqual(_get('multilingual.validator'));
  });

  it('FormSchema getSchema takes into account enableWith when defined', () => {
    const fields = [{
      field: 'image',
      label: 'Champ image',
      fieldType: 'text'
    }, {
      field: 'imageCredits',
      label: 'Crédits image',
      fieldType: 'text',
      enableWith: 'image',
      optional: false
    }];

    const s = getSchema(fields);

    let errored = false;

    try {
      s();
    } catch (e) {
      console.log(e);
      errored = true;
    }

    expect(errored).toBeFalsy();
  });

  it('getSchema ignores abstract fields', () => {
    const s = getSchema([{
      field: 'atextfield',
      label: { fr: 'Un champ texte' },
      fieldType: 'abstract'
    }, {
      field: 'anotherfield',
      label: { fr: 'Un nombre' },
      fieldType: 'number',
      min: 2
    }]);

    const clean = s({
      atextfield: 'Some text',
      anotherfield: 13
    });

    expect(clean).toStrictEqual({
      anotherfield: 13
    });
  });

  it(
    'FormSchema builds a schema based on list of field configurations',
    () => {
      const fields = [{
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        fieldType: 'text'
      }, {
        field: 'anotherfield',
        label: { fr: 'Un nombre' },
        fieldType: 'number',
        default: 13,
        min: 2
      }, {
        field: 'andanotherfield',
        label: {
          fr: 'Un choix'
        },
        fieldType: 'radio',
        options: [{
          id: 1,
          value: 'option-1',
          label: { fr: 'Option 1' }
        }, {
          id: 2,
          value: 'option-2',
          label: { fr: 'Option 2' }
        }]
      }];

      const s = getSchema(fields);

      const clean = s({
        atextfield: 'Some text',
        andanotherfield: 1
      });

      expect(clean).toStrictEqual({
        atextfield: 'Some text',
        anotherfield: 13,
        andanotherfield: 1
      });
    }
  );
});
