import schema from '../src/schema/index.js';
import choiceValidator from '../src/choice.js';
import integerValidator from '../src/integer.js';
import textValidator from '../src/text.js';

schema.register({
  choice: choiceValidator,
  integer: integerValidator,
  text: textValidator,
});

describe('optionalWith', () => {
  const validate = schema({
    eventAttendanceMode: {
      optional: false,
      type: 'choice',
      default: 1,
      unique: true,
      options: [1, 2, 3],
    },
    locationUid: {
      optionalWith: {
        field: 'eventAttendanceMode',
        value: 2,
      },
      type: 'integer',
    },
  });

  it('optionalWith makes field optional if ref value matches', () => {
    let errors;
    try {
      validate({
        eventAttendanceMode: 2,
      });
    } catch (e) {
      errors = e;
    }

    expect(errors).toBeUndefined();
  });

  it('optionalWith keeps field required if ref value does not match', () => {
    let errors;
    try {
      validate({
        eventAttendanceMode: 1,
      });
    } catch (e) {
      errors = e;
      return;
    }
    expect(errors[0].code).toBe('required');
  });

  it('optionalWith treats multiple values as logical OR', () => {
    const schemaValidate = schema({
      conditionTypes: {
        type: 'choice',
        unique: true,
        options: [1, 2, 3],
      },
      registration: {
        type: 'text',
        optionalWith: {
          field: 'conditionTypes',
          value: [1, 3],
        },
      },
    });

    const clean = schemaValidate({
      conditionTypes: 1,
    });

    const alsoClean = schemaValidate({
      conditionTypes: 3,
    });

    expect(clean).toEqual({ conditionTypes: 1, registration: null });
    expect(alsoClean).toEqual({ conditionTypes: 3, registration: null });

    let error;
    try {
      schemaValidate({
        conditionTypes: 2,
      });
    } catch (e) {
      error = e;
    }

    expect(error).toEqual([
      {
        origin: undefined,
        code: 'required',
        message: 'a string is required',
        field: 'registration',
      },
    ]);
  });

  it('optionalWith is overridden if optional is explicited', () => {
    const schemaValidate = schema({
      eventAttendanceMode: {
        optional: false,
        type: 'choice',
        default: 1,
        unique: true,
        options: [1, 2, 3],
      },
      locationUid: {
        optional: true,
        optionalWith: {
          field: 'eventAttendanceMode',
          value: 1,
        },
        type: 'integer',
      },
    });

    expect(
      schemaValidate({
        eventAttendanceMode: 2,
      }),
    ).toBeTruthy();
  });
});
