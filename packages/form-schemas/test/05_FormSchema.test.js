'use strict';

const FormSchema = require('../iso/FormSchema');
const customValidator = require('../stories/custom/wigglypoof.validator');

describe('form-schemas -05- FormSchema', () => {
  describe('getting started', () => {
    it('instanciate a new FormSchema by giving it nothing', () => {
      const s = new FormSchema();
      expect(s.isNew()).toBeTruthy();
    });

    it('a new FormSchema is empty', () => {
      const s = new FormSchema();
      expect(s.isEmpty()).toBeTruthy();
    });

    it('you can add a field to a form schema instance', () => {
      const s = new FormSchema();

      expect(s.getFieldCount()).toBe(0);

      s.addField({
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        fieldType: 'text'
      });

      expect(s.getFieldCount()).toBe(1);
    });

    it('but you can\'t add two fields with the same name', () => {
      const s = new FormSchema();
      let error = [];

      s.addField({
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        fieldType: 'text'
      });

      try {
        s.addField({
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBe('This field name is taken! : atextfield');
    });

    it('a FormSchema can be initialized with preset fields', () => {
      const s = new FormSchema({
        fields: [{
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        }, {
          field: 'anotherfield',
          label: { fr: 'Un nombre' },
          fieldType: 'number',
          min: 2
        }, {
          field: 'andanotherfield',
          label: {
            fr: 'Un choix'
          },
          fieldType: 'radio',
          options: [{
            value: 'option-1',
            label: { fr: 'Option 1' }
          }, {
            value: 'option-2',
            label: { fr: 'Option 2' }
          }]
        }],
        custom: null
      });

      expect(s.getFieldCount()).toBe(3);
    });

    it(
      'preset fields defining labels do not need to be given with language keys',
      () => {
        const s = new FormSchema({
          fields: [{
            field: 'asinglefield',
            label: 'Un champ texte',
            fieldType: 'text'
          }],
          defaultLabelLanguage: 'fr'
        });

        expect(s.getFields()[0].label).toStrictEqual({ fr: 'Un champ texte' });
      }
    );
  });

  describe('adding fields', () => {
    let s;

    beforeEach(() => {
      s = new FormSchema({
        fields: [{
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        }, {
          field: 'anotherfield',
          label: { fr: 'Un nombre' },
          fieldType: 'number',
          min: 2
        }, {
          field: 'andanotherfield',
          label: { fr: 'Un choix' },
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
        }]
      });
    });

    it('adding a field puts it at the bottom of the schema', () => {
      s.addField({
        field: 'anaddedfield',
        label: { fr: 'Un nouveau champ' }
      });

      expect(s.getField(3).field).toBe('anaddedfield');
    });
  });

  describe('updating all fields', () => {
    let s;

    beforeAll(() => {
      s = new FormSchema({
        nextOptionId: 1000,
        fields: [{
          field: 'aradiofield',
          fieldType: 'radio',
          label: 'Un choix unique',
          options: [{
            id: 1,
            label: 'Un',
            value: 'un'
          }, {
            label: 'Deux',
            value: 'deux'
          }]
        }]
      });

      s.updateFields([{
        field: 'aradiofield',
        fieldType: 'radio',
        label: 'Un choix unique',
        options: [{
          id: 1,
          label: 'Un',
          value: 'un'
        }, {
          label: 'Deux',
          value: 'deux'
        }, {
          label: 'Trois',
          value: 'trois'
        }]
      }, {
        field: 'acheckboxfield',
        fieldType: 'checkbox',
        label: 'Un choix multiple',
        options: [{
          label: 'A',
          value: 'a'
        }, {
          label: 'B',
          value: 'b'
        }]
      }]);
    });

    it('adds new fields', () => {
      const otherSchema = new FormSchema({
        fields: [{
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        }]
      });

      otherSchema.updateFields([{
        field: 'atextfield',
        label: 'Un texte',
        fieldType: 'text'
      }, {
        field: 'aninteger',
        label: 'Un entier',
        fieldType: 'integer'
      }]);

      expect(otherSchema.getData().fields.length).toBe(2);
    });

    it('removes absent fields', () => {
      const otherSchema = new FormSchema({
        fields: [{
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        }]
      });

      otherSchema.updateFields([{
        field: 'aninteger',
        label: 'Un entier',
        fieldType: 'integer'
      }]);

      expect(otherSchema.getData().fields.length).toBe(1);
      expect(otherSchema.getData().fields[0].field).toBe('aninteger');
    });

    it('removes absent fields (fix)', () => {
      const otherSchema = new FormSchema({
        id: 9999,
        custom: null,
        defaultLabelLanguage: null,
        nextOptionId: 1,
        fields: [{
          field: 'description',
          label: 'Name Band / Künstle',
          fieldType: 'abstract'
        }, {
          field: 'timings',
          info: 'Darunter ein +, damit man jeweils noch weitere Acts der Veranstaltung innerhalb des Events mit Zeiten anlegen kann, nach denen man dann suchen / nach Uhrzeit filtern kann',
          fieldType: 'abstract'
        }, {
          field: 'keywords',
          fieldType: 'abstract'
        }]
      });

      otherSchema.updateFields([{
        field: 'description',
        label: 'Name Band / Künstle',
        fieldType: 'abstract'
      }]);

      expect(otherSchema.getData().fields.map(f => f.field)).toStrictEqual(['description']);
    });

    it('options with missing id have been given one', () => {
      expect(s.getField('aradiofield').options.map(o => o.id)).toStrictEqual([1, 1002, 1003]);
    });

    it('options of newly added fields are given ids', () => {
      expect(s.getField('acheckboxfield').options.map(o => o.id)).toStrictEqual([1004, 1005]);
    });

    it('nextOptionId is incremented', () => {
      expect(s.getData().nextOptionId).toBe(1005);
    });

    it('ordering respects given fields order', () => {
      const otherSchema = new FormSchema({
        fields: [
          {
            field: 'hello',
            fieldType: 'abstract'
          },
          {
            field: 'cat',
            fieldType: 'abstract'
          }
        ]
      });

      otherSchema.updateFields([
        {
          field: 'location',
          fieldType: 'abstract'
        },
        {
          field: 'hello',
          fieldType: 'abstract'
        },
        {
          field: 'cat',
          fieldType: 'abstract'
        },
        {
          field: 'image',
          fieldType: 'abstract'
        }
      ]);

      expect(otherSchema.getData().fields.map(f => f.field)).toStrictEqual(['location', 'hello', 'cat', 'image']);
    });

    it('field-specific keys are kept', () => {
      const otherSchema = new FormSchema({
        fields: [
          {
            field: 'timings',
            fieldType: 'abstract',
            enabledRanges: 'someTimeRange'
          }
        ]
      });

      otherSchema.updateFields([
        {
          field: 'timings',
          fieldType: 'abstract',
          enabledRanges: 'someTimeRange'
        }
      ]);

      expect(otherSchema.getData().fields[0].enabledRanges).toBe('someTimeRange');
    });
  });

  describe('getting, moving and removing fields', () => {
    let s;

    beforeEach(() => {
      s = new FormSchema({
        fields: [{
          field: 'atextfield',
          label: { fr: 'Un champ texte' },
          fieldType: 'text'
        }, {
          field: 'anotherfield',
          label: { fr: 'Un nombre' },
          fieldType: 'number',
          min: 2
        }, {
          field: 'andanotherfield',
          label: { fr: 'Un choix' },
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
        }]
      });
    });

    it('Fields can be fetched by their position index in the schema', () => {
      expect(s.getField(1).field).toBe('anotherfield');
    });

    it('Fields can be moved down in the schema', () => {
      s.moveField(0, 2);

      expect(s.getField(2).field).toBe('atextfield');
    });

    it('Fields can also be moved up', () => {
      s.moveField(2, -2);
      expect(s.getField(0).field).toBe('andanotherfield');
    });

    it('A field move does not affect schema field count', () => {
      s.moveField(0, 2);
      expect(s.getFieldCount()).toBe(3);
    });

    it('Moves cannot throw fields out of schema index bounds', () => {
      let error;

      try {
        s.moveField(0, 102);
      } catch (e) {
        error = e;
      }

      expect(error).toBe('Move value exceeds possible value');
    });

    it('A field is removed using its index in the schema', () => {
      s.removeField(0);
      expect(s.getFieldCount()).toBe(2);
    });

    it('A field remove shifts the index of following fields', () => {
      s.removeField(1);
      expect(s.getField(1).field).toBe('andanotherfield');
    });
  });

  describe('deriving validator', () => {
    const fs = new FormSchema({
      fields: [{
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        fieldType: 'text'
      }, {
        field: 'anotherfield',
        label: { fr: 'Un nombre' },
        fieldType: 'number',
        min: 2
      }, {
        field: 'andanotherfield',
        label: { fr: 'Un choix' },
        fieldType: 'radio',
        optional: false,
        options: [{
          id: 1,
          value: 'option-1',
          label: { fr: 'Option 1' }
        }, {
          id: 2,
          value: 'option-2',
          label: { fr: 'Option 2' }
        }]
      }]
    });

    const validate = fs.getValidate();

    it(
      '.getValidate() returns the validator defined by the FormSchema fields',
      () => {
        expect(validate.default).toStrictEqual({
          atextfield: undefined,
          anotherfield: undefined,
          andanotherfield: undefined
        });
      }
    );

    // this fails when languages is a possibility
    it('.getValidate() validates choice fields correctly', () => {
      expect(validate({ andanotherfield: 1 })).toStrictEqual({
        atextfield: undefined,
        anotherfield: undefined,
        andanotherfield: 1
      });
    });

    it(
      '.getValidate by default returns a validator that processes the full schema',
      () => {
        let err;
        try {
          validate();
        } catch (errors) {
          // because andanotherfield is required
          err = errors;
        }
        expect(err.length).toBe(1);
      }
    );

    it(
      '.getValidate with draft option validates fields independently of their optional state',
      () => {
        const draftValidate = fs.getValidate({
          draft: true
        });

        const clean = draftValidate();

        expect(clean).toStrictEqual({
          atextfield: undefined,
          anotherfield: undefined,
          andanotherfield: undefined
        });
      }
    );
  });

  describe('extending FormSchema with custom types', () => {
    const fs = new FormSchema({
      custom: {
        wigglypoof: customValidator
      },
      fields: [{
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        fieldType: 'text'
      }, {
        field: 'acustomfield',
        label: { fr: 'Saisir Wigglypoof' },
        fieldType: 'wigglypoof'
      }]
    });

    const validate = fs.getValidate();

    it(
      'validate data with a schema that includes a custom field - throws an error',
      () => {
        let err;
        try {
          validate({
            atextfield: 'Un petit text',
            acustomfield: 'Not wigglypoof'
          });
        } catch (errors) {
          err = errors;
        }
        expect(err).toStrictEqual([{
          code: 'invalid',
          message: 'Not Wigglypoof',
          origin: 'Not wigglypoof',
          field: 'acustomfield'
        }]);
      }
    );

    it(
      'validate data with a schema that includes a custom field - valid',
      () => {
        const clean = validate({
          atextfield: 'un petit texte',
          acustomfield: 'Wigglypoof'
        });
        expect(clean).toStrictEqual({
          atextfield: 'un petit texte',
          acustomfield: 'Wigglypoof'
        });
      }
    );
  });
});
