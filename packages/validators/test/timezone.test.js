import validators from '../src/index.js';

describe('timezone validator', () => {
  const defaultValidateTimezone = validators.timezone();
  it('does not accept UTC+ format', () => {
    let errors;
    try {
      defaultValidateTimezone('UTC+1');
    } catch (e) {
      errors = e;
    }

    expect(errors).toEqual([
      {
        origin: 'UTC+1',
        code: 'timezone.invalid',
        message:
          'must be in Continent/City format (e.g., Europe/Paris, America/New_York)',
      },
    ]);
  });

  it('is happy with Continent/City format', () => {
    const clean = defaultValidateTimezone('Europe/Paris');

    expect(clean).toBe('Europe/Paris');
  });
});
