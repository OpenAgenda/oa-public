const validators = require('../src');

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

    try { validate('+++'); } catch (e) { errors = e; }

    expect(errors.length).toBe(1);
  });

  it('cleans using regex', () => {
    const validateAndClean = validators.regex({ regex: /[^/]+$/, clean: true });

    let errors = []; let
      clean = false;

    try { clean = validateAndClean('/image/path.png'); } catch (e) { errors = e; }

    expect(errors.length).toBe(0);

    expect(clean).toBe('path.png');
  });
});
