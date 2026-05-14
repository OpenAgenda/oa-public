import validators from '../src/index.js';
import schema from '../src/schema/index.js';

describe('schema validator', () => {
  describe('shallow schemas', () => {
    beforeAll(() => {
      // load up the validators
      // that will be used by the schema lib
      schema.register({
        text: validators.text,
        link: validators.link,
        number: validators.number,
      });
    });

    it('optional declared as undefined', () => {
      const validate = schema({
        alinkfield: {
          enableWith: null,
          optional: undefined,
          optionalWith: null,
          type: 'link',
        },
      });

      expect(validate({})).toEqual({});
    });

    it('validates an object with a basic schema', () => {
      const validate = schema({
        title: {
          type: 'text',
          min: 2,
          max: 100,
        },
      });

      expect(
        validate({
          title: 'Simple!',
        }),
      ).toEqual({
        title: 'Simple!',
      });
    });

    it('validates an object with a schema of two items', () => {
      const validate = schema({
        title: {
          type: 'text',
        },
        link: {
          type: 'link',
        },
      });

      expect(
        validate({
          title: 'This is not a link',
          link: 'this.is.not.a.title',
        }),
      ).toEqual({
        title: 'This is not a link',
        link: 'http://this.is.not.a.title',
      });
    });

    it('throws flat error list when one field is invalid', () => {
      const validate = schema({
        title: {
          type: 'text',
          optional: false,
        },
      });

      let errors = [];

      try {
        validate({});
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          field: 'title',
          code: 'required',
          message: 'a string is required',
          origin: undefined,
        },
      ]);
    });

    it('.default gives default values of schema with null set when no defaults are defined', () => {
      let errors = [];

      const validate = schema({
        title: {
          type: 'text',
          min: 2,
          max: 100,
          default: 'default text',
        },
        url: {
          type: 'link',
        },
      });

      try {
        expect(validate.default).toEqual({
          title: 'default text',
          url: null,
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);
    });
  });

  describe('deep schemas - simple cases', () => {
    let validate;

    beforeAll(() => {
      // load up the validators
      // that will be used by the schema lib
      schema.register({
        text: validators.text,
        link: validators.link,
        number: validators.number,
        boolean: validators.boolean,
      });

      validate = schema({
        title: {
          type: 'text',
        },
        sub: {
          fields: {
            description: {
              type: 'text',
              optional: false,
            },
          },
        },
      });
    });

    it('shallow-maps deeper schemas', () => {
      expect(
        validate({
          title: 'Testing',
          sub: {
            description: 'a description',
          },
        }),
      ).toEqual({
        title: 'Testing',
        sub: {
          description: 'a description',
        },
      });
    });

    it('validates another deep schema object', () => {
      const validateDeepSchemaObject = schema({
        title: {
          type: 'text',
          min: 2,
          max: 255,
          optional: false,
        },
        description: {
          type: 'text',
          max: 40,
        },
        image: {
          type: 'text',
        },
        url: {
          type: 'link',
        },
        settings: {
          credentials: {
            moderators: {
              type: 'boolean',
              default: false,
            },
            universe: {
              type: 'number',
              default: 42,
            },
          },
        },
      });

      const cleanObject = validateDeepSchemaObject({
        title: 'Puma',
        description: 'A feline',
        url: 'https://openagenda.com',
        settings: {
          credentials: {
            moderators: true,
          },
        },
      });

      expect(cleanObject).toEqual({
        title: 'Puma',
        description: 'A feline',
        url: 'https://openagenda.com',
        image: null,
        settings: {
          credentials: {
            moderators: true,
            universe: 42,
          },
        },
      });
    });

    it('undefined object give defaults value throughout schema', () => {
      const schemaValidate = schema({
        contribution: {
          type: {
            default: 0,
            type: 'number',
            optional: false,
            min: 0, // no contribution
            max: 2, // contribution on invitation only
          },
          message: {
            type: 'text',
          },
        },
      });

      let clean = false;
      let errors = [];

      try {
        clean = schemaValidate({});
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);

      expect(clean).toEqual({
        contribution: {
          type: 0,
          message: null,
        },
      });
    });

    it("undefined object give defaults value even if it's an explicit undefined", () => {
      const schemaValidate = schema({
        additionalField: {
          default: undefined,
          type: 'text',
          optional: true,
        },
      });

      const clean = schemaValidate({});

      expect(clean).toEqual({
        additionalField: undefined,
      });
    });

    it('undefined sub object is processed as an empty object', () => {
      const schemaValidate = schema({
        subobj: {
          somefield: {
            type: 'text',
            default: 'thedefaultvalue',
          },
        },
      });

      const clean = schemaValidate({ subobj: {} });

      expect(clean).toEqual({
        subobj: {
          somefield: 'thedefaultvalue',
        },
      });
    });

    it('invalid deep object gives flat error', () => {
      let errors = [];

      try {
        validate({
          title: 'Testing',
          sub: {},
        });
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          field: 'sub.description',
          code: 'required',
          message: 'a string is required',
          origin: undefined,
        },
      ]);
    });

    it('invalid deep object gives flat error - 2', () => {
      let errors;

      const schemaValidate = schema({
        title: {
          type: 'text',
          min: 2,
          max: 255,
          optional: false,
        },
        description: {
          type: 'text',
          max: 40,
        },
        image: {
          type: 'text',
        },
        url: {
          type: 'link',
        },
        settings: {
          credentials: {
            moderators: {
              type: 'boolean',
              default: false,
            },
            universe: {
              type: 'number',
              default: 42,
            },
          },
        },
      });

      try {
        schemaValidate({
          description: 'P',
          url: 'notalink',
          settings: {
            credentials: {
              universe: 'here',
            },
          },
        });
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          field: 'title',
          code: 'required',
          message: 'a string is required',
          origin: undefined,
        },
        {
          field: 'url',
          code: 'link.invalid',
          message: 'value is not a link',
          origin: 'notalink',
        },
        {
          field: 'settings.credentials.universe',
          code: 'number.invalid',
          message: 'not a number',
          origin: 'here',
        },
      ]);
    });

    it('simple schema structure (without fields key) is usable', () => {
      const schemaValidate = schema({
        title: {
          type: 'text',
        },
        sub: {
          // look ma', no fields key!
          description: {
            type: 'text',
          },
        },
      });

      const clean = schemaValidate({
        title: 'Testing',
        sub: {
          description: 'Boom',
        },
      });

      expect(clean).toEqual({
        title: 'Testing',
        sub: {
          description: 'Boom',
        },
      });
    });

    it('filters out any data not part of schema', () => {
      const schemaValidate = schema({
        title: {
          type: 'text',
          min: 2,
          max: 100,
        },
        url: {
          type: 'link',
        },
        settings: {
          someSetting: {
            type: 'number',
          },
        },
      });

      const clean = schemaValidate({
        title: 'the title',
        url: 'https://openagenda.com',
        settings: {
          someSetting: '23',
        },
        ignoredValue: 'fdsfds',
      });

      expect(clean).toEqual({
        title: 'the title',
        url: 'https://openagenda.com',
        settings: {
          someSetting: 23,
        },
      });
    });

    it('.default gives default values of schema with null when no default is defined', () => {
      const schemaValidate = schema({
        title: {
          type: 'text',
          min: 2,
          max: 100,
        },
        url: {
          type: 'link',
        },
        settings: {
          someSetting: {
            type: 'number',
            optional: false,
          },
        },
      });

      try {
        expect(schemaValidate.default).toEqual({
          title: null,
          url: null,
          settings: {
            someSetting: null,
          },
        });
      } catch (e) {
        console.log(e);
      }
    });
  });

  describe('lists in schemas', () => {
    beforeAll(() => {
      // load up the validators
      // that will be used by the schema lib
      schema.register({
        text: validators.text,
        link: validators.link,
        number: validators.number,
      });
    });

    it('list defaults as an empty array', () => {
      const schemaValidate = schema({
        aList: {
          list: true,
          fields: {
            message: {
              type: 'text',
            },
          },
        },
      });

      expect(schemaValidate.default).toEqual({
        aList: [],
      });
    });

    it('validates a list of texts', () => {
      let errors = [];
      let clean;

      const validator = schema({
        aListOfTexts: {
          type: 'text',
          optional: false,
          list: true,
        },
      });

      try {
        clean = validator({
          aListOfTexts: ['a', 'b', 'c'],
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);

      expect(clean).toEqual({
        aListOfTexts: ['a', 'b', 'c'],
      });
    });

    it('list of texts with min value set throws error if not enough items are given', () => {
      let errors = [];

      const validator = schema({
        aListOfTexts: {
          type: 'text',
          optional: false,
          list: {
            min: 2,
          },
        },
      });

      try {
        validator({
          aListOfTexts: ['ladida'],
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(1);

      expect(errors).toEqual([
        {
          field: 'aListOfTexts',
          code: 'list.tooshort',
          message: 'list is too short',
          origin: ['ladida'],
        },
      ]);
    });

    it('list of texts with max value set throws error if too many items are given', () => {
      let errors = [];

      const validator = schema({
        aListOfTexts: {
          type: 'text',
          optional: false,
          list: {
            max: 1,
          },
        },
      });

      try {
        validator({
          aListOfTexts: ['la', 'dida'],
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(1);

      expect(errors).toEqual([
        {
          field: 'aListOfTexts',
          code: 'list.toolong',
          message: 'list is too long',
          origin: ['la', 'dida'],
        },
      ]);
    });

    it('an optional list of texts with min does not throw error when fed an empty list', () => {
      let errors = [];

      const validator = schema({
        aListOfTexts: {
          type: 'text',
          optional: true,
          list: {
            min: 12,
          },
        },
      });

      try {
        validator({
          aListOfTexts: [],
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);
    });

    it('validates a list of objects', () => {
      let errors = [];
      let clean;

      const validator = schema({
        aListOfObjects: {
          list: true,
          fields: {
            message: {
              type: 'text',
            },
          },
        },
      });

      try {
        clean = validator({
          aListOfObjects: [
            {
              message: 'One',
            },
            {
              message: 'Two',
            },
            {
              message: 'Three',
            },
          ],
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);

      expect(clean).toEqual({
        aListOfObjects: [
          { message: 'One' },
          { message: 'Two' },
          { message: 'Three' },
        ],
      });
    });

    it('list defaults to empty list if value is undefined', () => {
      const validate = schema({
        list: true,
        fields: {
          message: {
            type: 'text',
          },
        },
      });
      let errors = [];

      try {
        expect(validate()).toEqual([]);
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);
    });

    it('list of objects can be too short', () => {
      let errors = [];

      const validator = schema({
        aListOfObjects: {
          list: {
            min: 4,
          },
          fields: {
            message: {
              type: 'text',
            },
          },
        },
      });

      try {
        validator({
          aListOfObjects: [
            {
              message: 'One',
            },
            {
              message: 'Two',
            },
            {
              message: 'Three',
            },
          ],
        });
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          field: 'aListOfObjects',
          code: 'list.tooshort',
          message: 'list is too short',
          origin: [
            {
              message: 'One',
            },
            {
              message: 'Two',
            },
            {
              message: 'Three',
            },
          ],
        },
      ]);
    });
  });

  describe('schema using list validator', () => {
    let validate;

    beforeAll(() => {
      schema.register({
        text: validators.text,
        phone: validators.phone,
        email: validators.email,
        list: validators.list,
      });

      validate = schema({
        title: {
          type: 'text',
        },
        registration: {
          type: 'list',
          types: ['phone', 'email'],
        },
      });
    });

    it('list validator validates a data of potentially multiple types', () => {
      expect(
        validate({
          title: 'Yay',
          registration: ['031', 'yay@site.com'],
        }),
      ).toEqual({
        title: 'Yay',
        registration: ['031', 'yay@site.com'],
      });
    });

    it('list validator provides field name in errors', () => {
      let errors = [];

      try {
        validate({
          registration: ['lallalala'],
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(2);

      expect(errors[0].field).toBe('registration');
    });
  });

  describe('partial validation', () => {
    let validate;

    beforeAll(() => {
      // load up the validators
      // that will be used by the schema lib
      schema.register({
        text: validators.text,
        link: validators.link,
        number: validators.number,
      });

      validate = schema({
        title: {
          type: 'text',
          min: 2,
          max: 100,
        },
        url: {
          type: 'link',
        },
        settings: {
          someSetting: {
            type: 'number',
          },
        },
      });
    });

    it('validates and cleans a part of the schema', () => {
      const clean = validate.part('url', 'https://openagenda.com');

      expect(clean).toBe('https://openagenda.com');
    });

    it('validates and cleans a deeper part of the schema', () => {
      const clean = validate.part('settings.someSetting', '12');

      expect(clean).toBe(12);
    });

    it('validates a subset of the schema', () => {
      const clean = validate.part(['url', 'settings.someSetting'], {
        url: 'https://openagenda.com',
        settings: {
          someSetting: 12,
        },
      });

      expect(clean).toEqual({
        url: 'https://openagenda.com',
        settings: {
          someSetting: 12,
        },
      });
    });

    it('validates a subset of the schema - with extra fields', () => {
      let errors = [];

      try {
        validate.part(['url', 'settings.someSetting', 'extra'], {
          url: 'https://openagenda.com',
          settings: {
            someSetting: 12,
          },
          extra: 'pourquoi pas..',
        });
      } catch (e) {
        errors = errors.concat(e);
      }

      expect(errors).toEqual([
        {
          code: 'field.notdefined',
          message: "field isn't defined",
          field: 'extra',
        },
      ]);
    });

    it('validates the provided subset of the schema', () => {
      let clean;

      try {
        clean = validate.part({
          url: 'https://openagenda.com',
          settings: {
            someSetting: 12,
          },
          extra: 'pourquoi pas..',
        });
      } catch (e) {
        console.log(e);
      }

      expect(clean).toEqual({
        url: 'https://openagenda.com',
        settings: {
          someSetting: 12,
        },
      });
    });

    it('validates and cleans a part of the schema - object case', () => {
      let clean = false;
      let errors = [];

      try {
        clean = validate.part('settings', {
          someSetting: 45,
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);

      expect(clean).toEqual({
        someSetting: 45,
      });
    });
  });

  describe('particular cases', () => {
    beforeAll(() => {
      // load up the validators
      // that will be used by the schema lib
      schema.register({
        text: validators.text,
        link: validators.link,
        number: validators.number,
        date: validators.date,
        choice: validators.choice,
        integer: validators.integer,
        boolean: validators.boolean,
      });
    });

    it('validates a schema with object named type', () => {
      let errors = [];
      let clean;

      const validator = schema({
        contribution: {
          type: {
            type: 'number',
          },
        },
      });

      try {
        clean = validator({
          contribution: {
            type: 42,
          },
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);

      expect(clean).toEqual({
        contribution: {
          type: 42,
        },
      });
    });

    it('validates a schema with dates', () => {
      let errors = [];

      const validator = schema({
        updatedAt: {
          type: 'date',
          optional: false,
        },
      });

      try {
        validator({ updatedAt: new Date() });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);
    });

    it('undefined root subobject is processed', () => {
      let errors = [];

      const validate = schema({
        settings: {
          contribution: {
            message: {
              type: 'text',
              default: 'thedefaultvalue',
            },
          },
        },
      });

      let clean = false;

      try {
        clean = validate({});
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);

      expect(clean).toEqual({
        settings: {
          contribution: {
            message: 'thedefaultvalue',
          },
        },
      });
    });

    it('invalid subobject value gives error with deep field name (description.fr)', () => {
      let errors = [];

      const validate = schema({
        description: {
          fr: {
            type: 'text',
            optional: false,
          },
        },
      });

      try {
        validate();
      } catch (e) {
        errors = e;
      }

      expect(errors[0].field).toBe('description.fr');
    });

    it('An object in place of a text should give an error', () => {
      let errors = [];

      const validate = schema({
        description: {
          type: 'text',
          optional: false,
        },
      });

      try {
        validate({ description: { hmm: 'caca-lô' } });
      } catch (e) {
        errors = e;
      }

      expect(errors[0].field).toBe('description');
    });

    it('A non optional integer generates an error if nothing is given', () => {
      let errors = [];

      const validate = schema({
        count: {
          type: 'integer',
          optional: false,
        },
      });

      try {
        validate({});
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          code: 'required',
          message: 'a integer is required',
          origin: undefined,
          field: 'count',
        },
      ]);
    });

    it('a non-object value for a sub-schema falls back to defaults', () => {
      const validate = schema({
        size: {
          width: {
            type: 'integer',
            default: null,
          },
          height: {
            type: 'integer',
            default: null,
          },
        },
      });

      const clean = validate({ size: 205890 });

      expect(clean).toEqual({
        size: { width: null, height: null },
      });
    });

    it('An number in place of a text should give an error (with strict option)', () => {
      let errors = [];

      const validate = schema({
        description: {
          type: 'text',
          optional: false,
          strict: true,
        },
      });

      try {
        validate({ description: 42 });
      } catch (e) {
        errors = e;
      }

      expect(errors[0].field).toBe('description');
    });
  });

  it('enableWith is evaluated by partial validation - not matching', () => {
    schema.register({
      choice: validators.choice,
      link: validators.link,
    });

    const validate = schema({
      attendanceMode: {
        default: 1,
        type: 'choice',
        unique: true,
        options: [1, 2, 3],
      },
      onlineAccessLink: {
        optional: false,
        enableWith: {
          field: 'attendanceMode',
          value: [2, 3],
        },
        type: 'link',
      },
    });

    expect(
      validate.part({
        attendanceMode: 1,
        onlineAccessLink: null,
      }),
    ).toEqual({
      attendanceMode: 1,
      onlineAccessLink: null,
    });
  });

  it('enableWith is evaluated by partial validation - matching', () => {
    schema.register({
      choice: validators.choice,
      link: validators.link,
    });

    const validate = schema({
      attendanceMode: {
        default: 1,
        type: 'choice',
        unique: true,
        options: [1, 2, 3],
      },
      onlineAccessLink: {
        optional: false,
        enableWith: {
          field: 'attendanceMode',
          value: [2, 3],
        },
        type: 'link',
      },
    });

    expect(
      validate.part({
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
      }),
    ).toEqual({
      attendanceMode: 2,
      onlineAccessLink: 'https://openagenda.com',
    });
  });

  it('enableWith is evaluated by partial validation - matching 2', () => {
    schema.register({
      choice: validators.choice,
      link: validators.link,
    });

    const validate = schema({
      attendanceMode: {
        default: 1,
        type: 'choice',
        unique: true,
        options: [1, 2, 3],
      },
      onlineAccessLink: {
        optional: false,
        enableWith: {
          field: 'attendanceMode',
          value: [2, 3],
        },
        type: 'link',
      },
    });

    expect(
      validate.part({
        attendanceMode: 2,
      }),
    ).toEqual({
      attendanceMode: 2,
    });
  });
});
