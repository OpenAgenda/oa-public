import booleanValidator from '../src/boolean';
import choiceValidator from '../src/choice';
import numberValidator from '../src/number';
import integerValidator from '../src/integer';
import textValidator from '../src/text';
import schema from '../src/schema';

schema.register({
  boolean: booleanValidator,
  choice: choiceValidator,
  text: textValidator,
  number: numberValidator,
  integer: integerValidator,
});

describe('schema - enableWith', () => {
  it('when enableWith is used on a required field, it can only be required if related field has a value', () => {
    const validate = schema({
      image: {
        type: 'text',
      },
      imageCredits: {
        optional: false,
        enableWith: 'image',
        type: 'text',
      },
    });

    let errored = false;

    try {
      validate({});
    } catch (e) {
      errored = true;
    }

    expect(errored).toBe(false);
  });

  it('when enableWith is used on a required field, it can only be required if related field has a boolean value', () => {
    const validate = schema({
      image: {
        type: 'text',
      },
      imagePasVolée: {
        optional: false,
        enableWith: 'image',
        type: 'boolean',
      },
    });

    let result;
    let errored = false;

    try {
      result = validate({});
    } catch (e) {
      errored = true;
    }

    expect(errored).toBe(false);
    expect(result.imagePasVolée).toBeNull();
  });

  it('simple enabling with a boolean at false means it is not enabled', () => {
    const validate = schema({
      checkToEnable: {
        type: 'boolean',
      },
      checkIfEnabled: {
        type: 'boolean',
        optional: false,
        enableWith: 'checkToEnable',
      },
    });

    const clean = validate({
      checkToEnable: false,
    });

    expect(clean).toEqual({ checkToEnable: false, checkIfEnabled: null });
  });

  it('simple enabling with a boolean at true means it is enabled', () => {
    let errors;

    const validate = schema({
      checkToEnable: {
        type: 'boolean',
      },
      checkIfEnabled: {
        type: 'boolean',
        optional: false,
        enableWith: 'checkToEnable',
      },
    });

    try {
      validate({
        checkToEnable: true,
      });
    } catch (e) {
      errors = e;
    }
    expect(errors).toEqual([
      {
        origin: undefined,
        code: 'required',
        message: 'a boolean is required',
        field: 'checkIfEnabled',
      },
    ]);
  });

  it('enableWith with a list value enables field only when the list is not empty', () => {
    const validate = schema({
      selection: {
        type: 'choice',
      },
      someField: {
        optional: false,
        enableWith: 'selection',
        type: 'text',
      },
    });

    let errored = false;

    try {
      validate();

      validate({
        selection: [],
      });
    } catch (e) {
      errored = true;
    }

    expect(errored).toBe(false);
  });

  it('enableWith can target a specific value of reference field', () => {
    const validate = schema({
      selection: {
        type: 'choice',
        options: [13, 14, 15],
      },
      someField: {
        optional: false,
        enableWith: {
          field: 'selection',
          value: 14,
        },
        type: 'text',
      },
    });

    let errors;

    try {
      validate({
        selection: 14,
      });
    } catch (e) {
      errors = e;
    }

    expect(errors[0].code).toEqual('required');
  });

  it('enableWith can target a specific cleaned value of reference field', () => {
    const validate = schema({
      selection: {
        type: 'choice',
        options: [13, 14, 15],
      },
      someField: {
        optional: false,
        enableWith: {
          field: 'selection',
          value: 14,
        },
        type: 'text',
      },
    });

    let enableWithErrors;

    try {
      validate({
        selection: '14',
      });
    } catch (e) {
      enableWithErrors = e;
    }

    expect(enableWithErrors[0].code).toEqual('required');
  });

  it('enableWith can target multiple values of reference field', () => {
    let errors;
    const validate = schema({
      eventAttendanceMode: {
        field: 'eventAttendanceMode',
        optional: false,
        type: 'choice',
        default: 1,
        unique: true,
        options: [1, 2, 3],
      },
      locationUid: {
        field: 'locationUid',
        optional: false,
        enableWith: {
          field: 'eventAttendanceMode',
          value: [1, 3],
        },
        type: 'integer',
      },
    });

    try {
      validate({
        eventAttendanceMode: 1,
      });

      throw new Error('Should not reach here');
    } catch (e) {
      errors = e;
    }

    expect([].concat(errors).pop().code).toBe('required');

    expect(validate({
      eventAttendanceMode: 1,
      locationUid: 1,
    })).toEqual({
      eventAttendanceMode: 1,
      locationUid: 1,
    });
  });

  describe('subkeys', () => {
    const validate = schema({
      location: {
        uid: {
          type: 'integer'
        },
        name: {
          type: 'text'
        }
      },
      room: {
        type: 'text',
        enableWith: {
          field: 'location',
          value: [{ uid: 123 }]
        }
      },
      entranceCode: {
        type: 'text',
        enableWith: {
          field: 'location',
          value: { uid: 123 }
        },
      }
    });

    it('enables the field when the subkey is associated to the right value', () => {
      const { location, room, entranceCode } = validate({
        location: {
          name: 'Here',
          uid: 123,
        },
        room: 'Office 427',
        entranceCode: 'ABC123',
      });

      expect(location).toEqual({
        name: 'Here',
        uid: 123
      });

      expect(room).toBe('Office 427');

      expect(entranceCode).toBe('ABC123');
    });

    it('does not enable the field when the subkey is not associated to the right value', () => {
      const { location, room, entranceCode } = validate({
        location: {
          name: 'There',
          uid: 456,
        },
        room: 'Office 427',
        entranceCode: 'DEF456',
      });

      expect(location).toEqual({
        name: 'There',
        uid: 456
      });

      expect(room).toBeNull();

      expect(entranceCode).toBeNull();
    });
  });

  it('when enableWith with value is different, field is not evaluated', () => {
    const validate = schema({
      selection: {
        type: 'choice',
        unique: true,
        options: [13, 14, 15],
      },
      someField: {
        optional: false,
        enableWith: {
          field: 'selection',
          value: 14,
        },
        type: 'text',
      },
    });

    const clean = validate({
      selection: 13,
    });

    expect(clean).toEqual({
      selection: 13,
      someField: null,
    });
  });

  it('when enableWith with value matches, valid value is cleaned', () => {
    const validate = schema({
      selection: {
        type: 'choice',
        options: [13, 14, 15],
      },
      someField: {
        optional: false,
        enableWith: {
          field: 'selection',
          value: 14,
        },
        type: 'text',
      },
    });

    const clean = validate({
      selection: 14,
      someField: 'some text',
    });

    expect(clean).toEqual({
      selection: [14],
      someField: 'some text',
    });
  });

  it('enableWith fields still throw errors with wrong input', () => {
    const validate = schema({
      acheckbox: {
        type: 'boolean',
      },
      someNumber: {
        optional: false,
        enableWith: 'acheckbox',
        type: 'number',
      },
    });

    let errors = [];

    try {
      validate({
        acheckbox: true,
        someNumber: 'twelve',
      });
    } catch (e) {
      errors = e;
    }

    expect(errors.length).toBe(1);
  });

  it('defaults are taken into account with enableWith', () => {
    let errors;
    try {
      const validate = schema({
        eventAttendanceMode: {
          optional: false,
          type: 'choice',
          default: 1,
          unique: true,
          options: [1, 2, 3],
        },
        locationUid: {
          optional: false,
          enableWith: {
            field: 'eventAttendanceMode',
            value: [1, 3],
          },
          type: 'integer',
          default: null,
        },
      });

      validate({});

      throw new Error('should not reach here');
    } catch (e) {
      errors = e;
    }

    expect([].concat(errors).pop().code).toEqual('required');
  });

  it('allowNull avoids loading default when null is specified', () => {
    const validate = schema({
      eventAttendanceMode: {
        type: 'choice',
        default: 1,
        allowNull: true,
        unique: true,
        options: [1, 2, 3],
      },
      locationUid: {
        optional: false,
        enableWith: {
          field: 'eventAttendanceMode',
          value: [1, 3],
        },
        type: 'integer',
        default: null,
      },
    });

    const clean = validate({
      eventAttendanceMode: null,
    });

    expect(clean).toEqual({
      eventAttendanceMode: null,
      locationUid: null,
    });
  });

  it('enableWith fields are filtered out if related field is not specified', () => {
    const validate = schema({
      acheckbox: {
        type: 'boolean',
      },
      someNumber: {
        optional: false,
        enableWith: 'acheckbox',
        type: 'number',
      },
    });

    const clean = validate({
      someNumber: 'twelve',
    });

    expect(clean.someNumber).toBeNull();
  });
});
