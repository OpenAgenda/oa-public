import validator from '../src/service/validator.js';

describe('session - unit (server): validate', () => {
  const sessionData = {
    id: 1,
    uid: 12345678,
    email: 'gaetan.latouche@cibul.net',
    expires: undefined,
    culture: 'fr',
    name: 'Gaetan Latouche',
    thumbnail: '//graph.facebook.com/100002280111541/picture',
    latestActivity: new Date('1981-02-28T03:00:00+0100'),
    isNew: false,
    isBlacklisted: false,
    transverseApiAccess: false,
  };

  it('server validate function describes data kept for session on server side', () => {
    const validate = validator({
      cultures: ['fr'],
    });

    expect(validate(sessionData)).toEqual(sessionData);
  });

  it('unknown culture triggers exception', () => {
    const validate = validator({
      cultures: ['en'],
    });

    let errors;

    try {
      validate(sessionData);
    } catch (e) {
      errors = e;
    }

    expect(errors).toEqual([
      {
        origin: 'fr',
        code: 'choice.required',
        message: 'a (known) value must be chosen',
        field: 'culture',
      },
    ]);
  });
});
