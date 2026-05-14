import validators from '../src/index.js';
import phone from '../src/phone.js';

describe('phone validator', () => {
  const validate = validators.phone({ field: 'telephone' });

  it('a phone number with spaces is a phone number', () => {
    const clean = validate('06 50 91 60');

    expect(clean).toBe('06 50 91 60');
  });

  it('an international phone number is a phone number', () => {
    const clean = validate('+33 (0)6 50 91 60 26');

    expect(clean).toBe('+33 (0)6 50 91 60 26');
  });

  it('a phone number with dots or dashes is a phone number', () => {
    const clean = validate('+(1) 800-123-123');

    expect(clean).toBe('+(1) 800-123-123');
  });

  it('an empty input for a compulsory value returns a required error', () => {
    let errors = [];

    try {
      validators.phone({ field: 'telephone', optional: false })();
    } catch (e) {
      errors = e;
    }

    expect(errors[0]).toEqual({
      origin: undefined,
      field: 'telephone',
      code: 'required',
      message: 'value must not be empty',
    });
  });

  it('is a phone and is trimmed', () => {
    const clean = validate(' 06509160 ');

    expect(clean).toBe('06509160');
  });

  it('is not a phone', () => {
    let error;
    try {
      validate('fdsqf');
      throw new Error('Should have thrown validation error');
    } catch (e) {
      error = e;
    }

    expect(error[0].code).toBe('phone.invalid');
    expect(error[0].field).toBe('telephone');
  });

  it('optional field accepts empty input', () => {
    const optionalValidate = validators.phone({
      field: 'telephone',
      optional: true,
    });

    let errors = [];
    let clean = null;

    try {
      clean = optionalValidate();
    } catch (e) {
      errors = e;
    }

    expect(errors.length).toBe(0);
    expect(clean).toBeNull();
  });

  it('fix: undefined default on required field does not break required', () => {
    const requiredValidate = phone({
      default: undefined,
      optional: false,
    });

    let error;

    try {
      requiredValidate();
      throw new Error('Should have thrown validation error');
    } catch (e) {
      error = e;
    }

    expect(error[0].code).toEqual('required');
  });
});
