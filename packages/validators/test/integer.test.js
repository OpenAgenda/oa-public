const validators = require('../src');

describe('integer validator', () => {
  it('validates an integer', () => {
    const validate = validators.integer();

    expect(validate(2)).toBe(2);
  });

  it('optional by default', () => {
    const validate = validators.integer();

    expect(validate()).toBeUndefined();
  });

  it('cleans an integer that was given as text', () => {
    expect(validators.integer()('2')).toBe(2);
  });

  it('throws error when random string is given', () => {
    let errors;
    try {
      validators.integer()('one two three');
    } catch (e) {
      errors = e;
    }

    expect(errors.length).toBe(1);
    expect(errors[0]).toEqual({
      code: 'integer.invalid',
      message: 'not an integer',
      origin: 'one two three'
    });
  });

  it('defaults to default when no value is given', () => {
    expect(validators.integer({
      default: 3
    })()).toBe(3);
  });

  it('...even when default is null', () => {
    expect(validators.integer({
      default: null
    })()).toBeNull();
  });

  it('throws an error if is not optional and null default is specified', () => {
    let errors = [];

    try {
      validators.integer({
        default: null,
        optional: false
      })();
    } catch (e) {
      errors = e;
    }

    expect(errors.length).toBe(1);
  });

  it('does not validate a number that is not an integer', () => {
    let errors = [];

    try {
      validators.integer()(2.2);
    } catch (e) {
      errors = e;
    }

    expect(errors.length).toBe(1);

    expect(errors[0]).toEqual({
      code: 'integer.invalid',
      message: 'not an integer',
      origin: 2.2
    });
  });

  it('validates a list of integers', () => {
    expect(
      validators.integer({
        list: true
      })([1, 2, 3])
    ).toEqual([1, 2, 3]);
  });

  it('if no value is provided to list validator, empty list is returned', () => {
    expect(validators.integer({ list: true })()).toEqual([]);
  });

  it('if no value is provided to list validator with predefined default, default is returned', () => {
    expect(validators.integer({
      list: { default: null }
    })()).toBeNull();
  });

  it('if its not optional, its not optional', () => {
    const validate = validators.integer({ optional: false });
    let errors;

    try {
      validate();
    } catch (e) {
      errors = e;
    }

    expect(errors).toEqual([{
      code: 'required',
      message: 'a integer is required',
      origin: undefined
    }]);
  });

  it('an empty string is read as an empty value', () => {
    let errors;

    const validate = validators.integer({
      optional: false
    });

    try {
      validate('');
    } catch (e) {
      errors = e;
    }

    expect(errors).toEqual([{
      code: 'required',
      message: 'a integer is required',
      origin: ''
    }]);
  });

  it('an empty string converts to undefined', () => {
    const validate = validators.integer();

    expect(validate('')).toBeUndefined();
  });

  it('if empty string is given to list integer validator, empty list is returned', () => {
    const listValidator = validators.integer({ list: true });
    expect(listValidator('')).toEqual([]);
  });
});
