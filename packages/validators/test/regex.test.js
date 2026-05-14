import validators from '../src/index.js';

describe('regex validator', () => {
  const validate = validators.regex({ field: 'stars', regex: /\*/g });

  it('matches', () => {
    let errors = [];

    try {
      validate('***');
    } catch (e) {
      errors = e;
    }

    expect(errors.length).toBe(0);
  });

  it('does not match', () => {
    let errors = [];

    try {
      validate('+++');
    } catch (e) {
      errors = e;
    }

    expect(errors.length).toBe(1);
  });

  it('cleans using regex', () => {
    const validateAndClean = validators.regex({ regex: /[^/]+$/, clean: true });

    let errors = [];
    let clean = false;

    try {
      clean = validateAndClean('/image/path.png');
    } catch (e) {
      errors = e;
    }

    expect(errors.length).toBe(0);

    expect(clean).toBe('path.png');
  });

  it('checks only numbers', () => {
    let errors;
    const validateNumberString = validators.regex({ regex: /[0-9]+$/ });
    try {
      validateNumberString('fdsq');
    } catch (e) {
      errors = e;
    }

    expect(errors.length).toBe(1);

    const clean = validateNumberString('789456');

    expect(clean).toBe('789456');
  });

  it('min', () => {
    let errors;
    const validateAtLeast14 = validators.regex({ regex: /[0-9]+$/, min: 14 });
    try {
      validateAtLeast14('123456789');
    } catch (e) {
      errors = e;
    }

    expect(errors.length).toBe(1);

    const clean = validateAtLeast14('12345678901234');

    expect(clean).toBe('12345678901234');
  });
});
