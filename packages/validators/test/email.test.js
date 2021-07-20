import validators from '../src';

describe('email validator', () => {
  const validate = validators.email({ field: 'email' });

  it('is an email and is trimmed', () => {
    expect(validate(' kaore@cibul.net ')).toBe('kaore@cibul.net');
  });

  it('returns null if input is null and validaor is optional', () => {
    expect(validators.email({ optional: true })()).toBeNull();
  });

  it('is not an email', () => {
    let errors;

    try {
      validate('fdsqf');
    } catch (e) {
      errors = e;
    }

    expect(errors[0].code).toBe('email.invalid');
  });

  it('some long random string with an email does not validate', () => {
    let errors;

    try {
      validate('Amandine Plas (chargéés de la com et du spons) contacts: protable 06 33 09 49 72 email: usmelunhand@wanadoo.fr');
    } catch (e) {
      errors = e;
    }

    expect(errors[0].code).toBe('email.invalid');
  });

  it('validate lists of emails', () => {
    const emails = [
      'kev@gmail.com',
      'in@gmail.com',
      'ber@gmail.com',
      'to@gmail.com',
      'mmier@gmail.com'
    ];
    expect(validators.email({ list: true })(emails)).toEqual(emails);
  });

  it('invalid emails', () => {
    const errors = [];

    const validateEmail = validators.email();

    const notEmails = [
      'momo@bertho@gmail.com',
      'kevin.bertho@gmail.com;'
    ];

    notEmails.forEach(notEmail => {
      try {
        validateEmail(notEmail);
      } catch (e) {
        errors.push(e);
      }
    });

    expect(notEmails.length).toBe(errors.length);
  });

  it('validate empty lists of emails for non optional validator', () => {
    let errors;

    try {
      validators.email({ list: true, optional: false })([]);
    } catch (e) {
      errors = e;
    }

    expect(errors).toEqual([{
      field: undefined,
      code: 'list.required',
      message: 'list cannot be empty',
      origin: []
    }]);
  });
});
